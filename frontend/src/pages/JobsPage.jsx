import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const S = {
  page: { display: 'flex', minHeight: 'calc(100vh - 60px)' },

  // Sidebar
  sidebar: {
    width: '220px', flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.04)',
    padding: '24px 12px',
    background: 'rgba(4,4,10,0.6)',
  },
  sectionLabel: {
    fontSize: '10px', fontWeight: 700, color: '#1e3a5f',
    textTransform: 'uppercase', letterSpacing: '1.5px',
    padding: '0 10px', marginBottom: '8px', display: 'block',
  },
  sideItem: (active) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 10px', borderRadius: '8px',
    fontSize: '13px', cursor: 'pointer',
    marginBottom: '1px', transition: 'all 0.18s ease',
    color: active ? '#a5b4fc' : '#475569',
    background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' : 'transparent',
    border: active ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
  }),
  sideCount: (active) => ({
    fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 600,
    background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
    color: active ? '#818cf8' : '#334155',
  }),

  // Main
  main: { flex: 1, padding: '32px 40px' },
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' },
  pageTitle: {
    fontSize: '24px', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '5px',
    background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  pageSub: { fontSize: '13px', color: '#334155' },
  kpis: { display: 'flex', gap: '24px' },
  kpi: { textAlign: 'right' },
  kpiVal: (color) => ({ fontSize: '26px', fontWeight: 900, letterSpacing: '-1px', color }),
  kpiLabel: { fontSize: '11px', color: '#334155', marginTop: '1px' },

  // Search
  searchRow: { display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center' },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(15,15,25,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '10px 16px', transition: 'all 0.2s ease',
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(15,15,25,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '10px 14px',
    fontSize: '12px', color: '#475569', cursor: 'pointer',
    transition: 'all 0.2s ease', whiteSpace: 'nowrap',
  },

  // Table
  tableWrap: {
    background: 'rgba(8,8,18,0.6)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(10px)',
  },
  th: {
    padding: '12px 18px', textAlign: 'left',
    fontSize: '11px', fontWeight: 600, color: '#1e3a5f',
    textTransform: 'uppercase', letterSpacing: '1px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  td: { padding: '14px 18px', verticalAlign: 'middle' },
  coName: { fontSize: '13px', fontWeight: 600, color: '#e2e8f0' },
  coSource: { fontSize: '11px', color: '#1e3a5f', marginTop: '1px' },
  roleName: { fontSize: '13px', fontWeight: 500, color: '#cbd5e1' },
  newChip: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: 'rgba(34,197,94,0.1)', color: '#4ade80',
    border: '1px solid rgba(34,197,94,0.2)',
    fontSize: '10px', fontWeight: 700, padding: '2px 8px',
    borderRadius: '20px', marginLeft: '8px',
  },
  saveBtn: (saved) => ({
    padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 500,
    background: saved ? 'rgba(34,197,94,0.07)' : 'transparent',
    border: saved ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)',
    color: saved ? '#4ade80' : '#475569',
    cursor: 'pointer', transition: 'all 0.18s ease',
  }),
  applyBtn: {
    padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white', cursor: 'pointer', transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none',
  },
  scrapeBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white', cursor: 'pointer', transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 0 20px rgba(99,102,241,0.25)',
  },
}

const COMPANIES = [
  { name: 'Google', color: '#4285f4', bg: 'linear-gradient(135deg,#4285f4,#1a73e8)' },
  { name: 'Meta', color: '#1877f2', bg: 'linear-gradient(135deg,#1877f2,#0a52cc)' },
  { name: 'Amazon', color: '#ff9900', bg: 'linear-gradient(135deg,#ff9900,#cc7700)' },
  { name: 'Microsoft', color: '#00a1f1', bg: 'linear-gradient(135deg,#00a1f1,#0078d4)' },
  { name: 'Apple', color: '#999', bg: 'linear-gradient(135deg,#888,#555)' },
  { name: 'Stripe', color: '#635bff', bg: 'linear-gradient(135deg,#635bff,#4f46e5)' },
  { name: 'Netflix', color: '#e50914', bg: 'linear-gradient(135deg,#e50914,#b20710)' },
]

function getCompanyStyle(name) {
  return COMPANIES.find(c => c.name === name) || { color: '#818cf8', bg: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
}

function isNewJob(postedAt) {
  if (!postedAt) return false
  return (Date.now() - new Date(postedAt)) < 24 * 60 * 60 * 1000
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date)
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return 'Just now'
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [hoveredRow, setHoveredRow] = useState(null)
  const { token } = useAuth()

  const fetchJobs = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (filterCompany) params.company = filterCompany
      const res = await api.get('/jobs', { params })
      setJobs(res.data.jobs || res.data || [])
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScrape = async () => {
    setScraping(true)
    try {
      await api.post('/jobs/scrape')
      await fetchJobs()
    } catch (err) {
      console.error('Scrape failed:', err)
    } finally {
      setScraping(false)
    }
  }

  useEffect(() => { fetchJobs() }, [search, filterCompany])

  const newCount = jobs.filter(j => isNewJob(j.posted_at)).length

  return (
    <div style={S.page}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{ marginBottom: '28px' }}>
          <span style={S.sectionLabel}>Companies</span>
          {COMPANIES.map(co => {
            const count = jobs.filter(j => j.company === co.name).length
            const active = filterCompany === co.name
            return (
              <div
                key={co.name}
                style={S.sideItem(active)}
                onClick={() => setFilterCompany(active ? '' : co.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: co.color, flexShrink: 0 }} />
                  {co.name}
                </div>
                <span style={S.sideCount(active)}>{count}</span>
              </div>
            )
          })}
        </div>
        <div>
          <span style={S.sectionLabel}>Quick Filters</span>
          {['🆕 New today', '🎓 New grad', '🌎 Remote', '📍 On-site'].map(f => (
            <div key={f} style={S.sideItem(false)}>{f}</div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        {/* Header */}
        <div style={S.pageHeader}>
          <div>
            <div style={S.pageTitle}>Job Listings</div>
            <div style={S.pageSub}>Scraped directly from FAANG portals — 3–4 hrs before LinkedIn</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={S.kpis}>
              <div style={S.kpi}>
                <div style={S.kpiVal('#818cf8')}>{jobs.length}</div>
                <div style={S.kpiLabel}>Total Jobs</div>
              </div>
              <div style={S.kpi}>
                <div style={S.kpiVal('#4ade80')}>{newCount}</div>
                <div style={S.kpiLabel}>New Today</div>
              </div>
            </div>
            <button style={S.scrapeBtn} onClick={handleScrape} disabled={scraping}>
              {scraping ? '⏳ Scraping...' : '🔄 Scrape Now'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={S.searchRow}>
          <div style={S.searchWrap}>
            <span style={{ fontSize: '14px', color: '#1e3a5f' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, skill, or keyword..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#94a3b8', width: '100%' }}
            />
          </div>
          <div style={S.filterBtn}>📍 All Locations ▾</div>
          <div style={S.filterBtn}>💼 Job Type ▾</div>
          <div style={S.filterBtn}>📅 Any Date ▾</div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#334155', padding: '80px 0' }}>Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: '#475569', fontSize: '15px' }}>No jobs found</p>
            <p style={{ color: '#1e3a5f', fontSize: '13px', marginTop: '6px' }}>Try clicking Scrape Now to fetch the latest jobs</p>
          </div>
        ) : (
          <div style={S.tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Company', 'Role', 'Location', 'Posted', 'Actions'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => {
                  const co = getCompanyStyle(job.company)
                  const isNew = isNewJob(job.posted_at)
                  return (
                    <tr
                      key={job.id}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: i < jobs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        background: hoveredRow === i ? 'rgba(99,102,241,0.04)' : 'transparent',
                        transition: 'background 0.18s ease',
                      }}
                    >
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 800, color: 'white',
                            background: co.bg, border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'transform 0.2s ease',
                            transform: hoveredRow === i ? 'scale(1.06)' : 'scale(1)',
                          }}>
                            {(job.company || '?').charAt(0)}
                          </div>
                          <div>
                            <div style={S.coName}>{job.company || 'Unknown'}</div>
                            <div style={S.coSource}>{job.source || 'career portal'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={S.roleName}>{job.title}</span>
                        {isNew && <span style={S.newChip}>● NEW</span>}
                      </td>
                      <td style={{ ...S.td, fontSize: '12px', color: '#475569' }}>
                        📍 {job.location || 'N/A'}
                      </td>
                      <td style={{ ...S.td, fontSize: '12px', color: '#1e3a5f' }}>
                        {timeAgo(job.posted_at)}
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button style={S.saveBtn(false)}>🔖 Save</button>
                          <a href={job.url} target="_blank" rel="noopener noreferrer" style={S.applyBtn}>
                            Apply →
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsPage