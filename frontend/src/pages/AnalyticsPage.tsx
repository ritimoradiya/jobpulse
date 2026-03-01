import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#7c3aed', '#9333ea'];

const tooltipStyle = {
  contentStyle: {
    background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#fff', fontSize: 12
  },
  cursor: { fill: 'rgba(99,102,241,0.08)' }
};

// ─── Role categorizer ──────────────────────────────────────────────────────────
const ROLE_PATTERNS = [
  { label: 'Software Engineer',    keywords: ['software engineer', 'software developer', 'swe', 'full stack', 'fullstack', 'full-stack', 'frontend', 'front-end', 'backend', 'back-end', 'web developer'] },
  { label: 'Data Engineer',        keywords: ['data engineer', 'etl', 'data pipeline', 'databricks', 'spark'] },
  { label: 'Data Scientist',       keywords: ['data scientist', 'data science'] },
  { label: 'Data Analyst',         keywords: ['data analyst', 'business analyst', 'bi analyst', 'analytics engineer'] },
  { label: 'ML Engineer',          keywords: ['machine learning', 'ml engineer', 'mlops', 'ai engineer', 'deep learning'] },
  { label: 'DevOps / Cloud',       keywords: ['devops', 'cloud engineer', 'site reliability', 'sre', 'infrastructure', 'platform engineer', 'devsecops'] },
  { label: 'Product Manager',      keywords: ['product manager', 'product management', 'pm ', 'program manager'] },
  { label: 'Systems Engineer',     keywords: ['systems engineer', 'embedded', 'firmware', 'hardware'] },
  { label: 'Security Engineer',    keywords: ['security engineer', 'cybersecurity', 'information security', 'appsec'] },
  { label: 'QA / Test Engineer',   keywords: ['qa engineer', 'quality assurance', 'test engineer', 'sdet'] },
  { label: 'Mobile Engineer',      keywords: ['ios', 'android', 'mobile engineer', 'react native', 'flutter'] },
];

function categorizeTitle(title) {
  const t = title.toLowerCase();
  for (const role of ROLE_PATTERNS) {
    if (role.keywords.some(k => t.includes(k))) return role.label;
  }
  return 'Other';
}

function getRoleBreakdown(titles) {
  const counts = {};
  titles.forEach(title => {
    const cat = categorizeTitle(title);
    counts[cat] = (counts[cat] || 0) + 1;
  });
  const total = titles.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label, count,
      pct: total > 0 ? ((count / total) * 100).toFixed(1) : '0'
    }));
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleBreakdown, setShowRoleBreakdown] = useState(false);
  const [roleBreakdown, setRoleBreakdown] = useState([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = [
          api.get('/analytics/summary'),
          api.get('/analytics/trends'),
        ];
        if (token) {
          requests.push(
            api.get('/analytics/my-activity', {
              headers: { Authorization: `Bearer ${token}` }
            })
          );
        }
        const results = await Promise.all(requests);
        setSummary(results[0].data);
        setTrends(results[1].data);
        if (token && results[2]) setActivity(results[2].data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleJobsAppliedClick = async () => {
    if (showRoleBreakdown) { setShowRoleBreakdown(false); return; }
    setBreakdownLoading(true);
    try {
      const res = await api.get('/applied/breakdown', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const titles = res.data.titles;
      if (titles.length === 0) { setRoleBreakdown([]); setShowRoleBreakdown(true); return; }

      // Use Claude to categorize intelligently
      const aiRes = await api.post('/ai/categorize-roles', { titles });
      const categories = aiRes.data.categories;
      const total = titles.length;
      const breakdown = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({
          label, count,
          pct: ((count / total) * 100).toFixed(1)
        }));
      setRoleBreakdown(breakdown);
      setShowRoleBreakdown(true);
    } catch (err) {
      console.error('Failed to fetch breakdown:', err);
    } finally {
      setBreakdownLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#475569', fontSize: 14 }}>
      Loading analytics...
    </div>
  );

  const companyData = summary?.byCompany?.map(c => ({
    name: c.company, jobs: parseInt(c.count)
  })) || [];

  const perDayData = trends?.perDay?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    jobs: parseInt(d.count)
  })) || [];

  const fillDays = (rows) => {
    const map = {};
    (rows || []).forEach(r => {
      const key = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[key] = parseInt(r.count);
    });
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      result.push({ date: key, count: map[key] || 0 });
    }
    return result;
  };

  const appliedPerDay = fillDays(activity?.appliedPerDay);
  const savedPerDay = fillDays(activity?.savedPerDay);

  const card = {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, padding: '24px', marginBottom: 16,
  };

  const sectionTitle = {
    fontSize: 11, fontWeight: 700, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20,
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Analytics</h1>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Jobs',        value: summary?.totalJobs?.toLocaleString(), color: '#818cf8' },
          { label: 'Companies Tracked', value: summary?.totalCompanies,              color: '#a78bfa' },
          { label: 'Added Today',       value: summary?.newToday?.toLocaleString(),  color: '#4ade80' },
          { label: 'Most Active',       value: companyData[0]?.name || '—',          color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{ ...card, marginBottom: 0, textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs Detected Over Time */}
      <div style={card}>
        <div style={sectionTitle}>Jobs Detected Over Time</div>
        <p style={{ fontSize: 12, color: '#334155', margin: '-14px 0 16px' }}>New listings added per day (last 30 days)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={perDayData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="jobs" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* My Activity */}
      {activity && (
        <>
          {/* Activity stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {/* Jobs Applied — clickable */}
            <div
              onClick={handleJobsAppliedClick}
              style={{
                ...card, marginBottom: 0, textAlign: 'center', padding: '18px 16px',
                cursor: 'pointer', transition: 'all 0.2s',
                border: showRoleBreakdown ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.06)',
                background: showRoleBreakdown ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
              }}
              onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(251,191,36,0.3)'}
              onMouseLeave={e => {
                if (!showRoleBreakdown)
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>
                {breakdownLoading ? '...' : activity.totalApplied}
              </div>
              <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Jobs Applied
              </div>
              <div style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>
                {showRoleBreakdown ? 'Click to collapse ↑' : 'Click to see breakdown →'}
              </div>
            </div>

            {[
              { label: 'Jobs Saved',    value: activity.totalSaved,   color: '#4ade80' },
              { label: 'Active Alerts', value: activity.activeAlerts, color: '#818cf8' },
            ].map(s => (
              <div key={s.label} style={{ ...card, marginBottom: 0, textAlign: 'center', padding: '18px 16px' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Role Breakdown — expands when Jobs Applied is clicked */}
          {showRoleBreakdown && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={sectionTitle}>Applied Roles Breakdown</div>
              {roleBreakdown.length === 0 ? (
                <div style={{ color: '#334155', fontSize: 13 }}>No applied jobs found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {roleBreakdown.map((r, i) => (
                    <div key={r.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: COLORS[i % COLORS.length],
                            display: 'inline-block', flexShrink: 0,
                          }} />
                          <span style={{ fontSize: 13, color: '#cbd5e1' }}>{r.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 12, color: '#475569' }}>{r.count} job{r.count > 1 ? 's' : ''}</span>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: COLORS[i % COLORS.length], minWidth: 40, textAlign: 'right'
                          }}>{r.pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.04)' }}>
                        <div style={{
                          height: 6, borderRadius: 99,
                          width: `${r.pct}%`, background: COLORS[i % COLORS.length],
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applied + Saved charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={card}>
              <div style={sectionTitle}>Applications per Day</div>
              <p style={{ fontSize: 12, color: '#334155', margin: '-14px 0 16px' }}>Jobs you marked as applied (last 30 days)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={appliedPerDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Applied" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={card}>
              <div style={sectionTitle}>Saves per Day</div>
              <p style={{ fontSize: 12, color: '#334155', margin: '-14px 0 16px' }}>Jobs you saved (last 30 days)</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={savedPerDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#4ade80" strokeWidth={2} dot={false} name="Saved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Company Breakdown Table */}
      <div style={card}>
        <div style={sectionTitle}>Company Breakdown</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Company', 'Total Jobs', 'Share', 'Distribution'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#334155',
                  textTransform: 'uppercase', letterSpacing: '0.6px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companyData.map((c, i) => {
              const pct = ((c.jobs / summary.totalJobs) * 100).toFixed(1);
              return (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px', fontSize: 13, color: '#cbd5e1', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                      marginRight: 8, background: COLORS[i % COLORS.length]
                    }} />
                    {c.name}
                  </td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#94a3b8' }}>{c.jobs.toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: '#94a3b8' }}>{pct}%</td>
                  <td style={{ padding: '12px', width: '35%' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 6 }}>
                      <div style={{
                        height: 6, borderRadius: 4, width: `${pct}%`,
                        background: COLORS[i % COLORS.length], transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}