import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const LIMIT = 100

const S = {
  page: { display: 'flex', minHeight: 'calc(100vh - 60px)' },
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
  searchRow: { display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' },
  searchWrap: {
    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
    background: 'rgba(15,15,25,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '10px 16px', transition: 'all 0.2s ease',
    minWidth: '200px',
  },
  dropdown: {
    background: 'rgba(15,15,25,0.8)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', padding: '10px 14px',
    fontSize: '12px', color: '#475569',
    cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
  },
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
  appliedBtn: (applied) => ({
    padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 500,
    background: applied ? 'rgba(251,191,36,0.08)' : 'transparent',
    border: applied ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.08)',
    color: applied ? '#fbbf24' : '#475569',
    cursor: 'pointer', transition: 'all 0.18s ease',
  }),
  applyBtn: {
    padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white', cursor: 'pointer', transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.08)', textDecoration: 'none',
    display: 'inline-block',
  },
  scrapeBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    padding: '8px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: 'white', cursor: 'pointer', transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 0 20px rgba(99,102,241,0.25)',
  },
  pageBtn: (disabled) => ({
    padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
    background: disabled ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: disabled ? '#334155' : '#818cf8',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
  }),
  toast: {
    position: 'fixed', bottom: '24px', right: '24px',
    background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '12px', padding: '14px 20px',
    display: 'flex', alignItems: 'center', gap: '10px',
    color: '#4ade80', fontSize: '13px', fontWeight: 600,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 9999, transition: 'all 0.3s ease',
  }
}

const COMPANIES = [
  { name: 'Google',        color: '#4285f4', bg: 'linear-gradient(135deg,#4285f4,#1a73e8)' },
  { name: 'Netflix',       color: '#e50914', bg: 'linear-gradient(135deg,#e50914,#b20710)' },
  { name: 'Airbnb',        color: '#ff385c', bg: 'linear-gradient(135deg,#ff385c,#bd1e59)' },
  { name: 'Nvidia',        color: '#76b900', bg: 'linear-gradient(135deg,#76b900,#4a7400)' },
  { name: 'Salesforce',    color: '#00a1e0', bg: 'linear-gradient(135deg,#00a1e0,#0070ad)' },
  { name: 'Adobe',         color: '#ff0000', bg: 'linear-gradient(135deg,#ff0000,#cc0000)' },
  { name: 'Fidelity',      color: '#4caf50', bg: 'linear-gradient(135deg,#4caf50,#388e3c)' },
  { name: 'Athena Health', color: '#6366f1', bg: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
]

const QUICK_FILTERS = [
  { label: '🆕 New today', key: 'newToday' },
  { label: '🎓 New grad',  key: 'newGrad' },
  { label: '🌎 Remote',    key: 'remote' },
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
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [activeQuickFilter, setActiveQuickFilter] = useState('')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [savedJobIds, setSavedJobIds] = useState(new Set())
  const [appliedJobIds, setAppliedJobIds] = useState(new Set())
  const [companyCounts, setCompanyCounts] = useState({})
  const [locations, setLocations] = useState([])
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const { token } = useAuth()
  const navigate = useNavigate()

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const fetchJobs = async (newOffset = 0) => {
    setLoading(true)
    try {
      const params = { limit: LIMIT, offset: newOffset, sort: sortBy }
      if (search) params.search = search
      if (filterCompany) params.company = filterCompany
      if (filterLocation) params.location = filterLocation
      if (activeQuickFilter) params.quick = activeQuickFilter
      const res = await api.get('/jobs', { params })
      setJobs(res.data.jobs || [])
      setTotal(res.data.total || 0)
      setOffset(newOffset)
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyCounts = async () => {
    try {
      const res = await api.get('/analytics/summary')
      const counts = {}
      res.data.byCompany?.forEach(c => { counts[c.company] = parseInt(c.count) })
      setCompanyCounts(counts)
    } catch (err) {
      console.error('Failed to fetch counts:', err)
    }
  }

  const fetchLocations = async () => {
    try {
      const res = await api.get('/analytics/locations')
      setLocations(res.data.locations || [])
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  const fetchSaved = async () => {
    if (!token) return
    try {
      const res = await api.get('/tracked', authHeaders)
      const data = res.data
      const list = Array.isArray(data) ? data : (data.tracked || data.jobs || [])
      setSavedJobIds(new Set(list.map(item => item.job_id)))
    } catch (err) {
      console.error('Failed to fetch saved:', err)
    }
  }

  const fetchApplied = async () => {
    if (!token) return
    try {
      const res = await api.get('/applied/ids', authHeaders)
      setAppliedJobIds(new Set(res.data))
    } catch (err) {
      console.error('Failed to fetch applied:', err)
    }
  }

  const showToast = (message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  const handleScrape = async () => {
    setScraping(true)
    try {
      await api.post('/jobs/scrape')
      await fetchJobs(0)
      await fetchCompanyCounts()
    } catch (err) {
      console.error('Scrape failed:', err)
    } finally {
      setScraping(false)
    }
  }

  const toggleSave = async (jobId) => {
    if (!token) { navigate('/login'); return }
    try {
      if (savedJobIds.has(jobId)) {
        await api.delete(`/tracked/${jobId}`, authHeaders)
        setSavedJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s })
      } else {
        await api.post('/tracked', { job_id: jobId }, authHeaders)
        setSavedJobIds(prev => new Set([...prev, jobId]))
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const toggleApplied = async (jobId) => {
    if (!token) { navigate('/login'); return }
    try {
      if (appliedJobIds.has(jobId)) {
        await api.delete(`/applied/${jobId}`, authHeaders)
        setAppliedJobIds(prev => { const s = new Set(prev); s.delete(jobId); return s })
        showToast('Removed from applied')
      } else {
        await api.post(`/applied/${jobId}`, {}, authHeaders)
        setAppliedJobIds(prev => new Set([...prev, jobId]))
        showToast('✅ Marked as applied!')
      }
    } catch (err) {
      console.error('Applied toggle failed:', err)
    }
  }

  const handleQuickFilter = (key) => {
    setActiveQuickFilter(prev => prev === key ? '' : key)
    setOffset(0)
  }

  useEffect(() => {
    const socket = io('http://localhost:5000')
    socket.on('new_jobs', (data) => {
      fetchJobs(0)
      fetchCompanyCounts()
      showToast(`🆕 ${data.count} new job${data.count > 1 ? 's' : ''} detected!`)
    })
    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    fetchJobs(0)
    fetchCompanyCounts()
    fetchLocations()
  }, [search, filterCompany, filterLocation, sortBy, activeQuickFilter])

  useEffect(() => {
    fetchSaved()
    fetchApplied()
  }, [token])

  const filteredJobs = jobs.filter(j => j.title && !j.title.startsWith('[TEMPLATE]'))
  const newCount = jobs.filter(j => isNewJob(j.posted_at)).length

  return (
    <div style={S.page}>

      {/* Toast — no bell icon */}
      {toast && (
        <div style={S.toast}>
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{ marginBottom: '28px' }}>
          <span style={S.sectionLabel}>Companies</span>
          {COMPANIES.map(co => {
            const count = companyCounts[co.name] || 0
            const active = filterCompany === co.name
            return (
              <div key={co.name} style={S.sideItem(active)} onClick={() => setFilterCompany(active ? '' : co.name)}>
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
          {QUICK_FILTERS.map(f => (
            <div key={f.key} style={S.sideItem(activeQuickFilter === f.key)} onClick={() => handleQuickFilter(f.key)}>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <div style={S.pageHeader}>
          <div>
            <div style={S.pageTitle}>Job Listings</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={S.kpis}>
              <div style={S.kpi}>
                <div style={S.kpiVal('#818cf8')}>{total.toLocaleString()}</div>
                <div style={S.kpiLabel}>Total Jobs</div>
              </div>
              <div style={S.kpi}>
                <div style={S.kpiVal('#4ade80')}>{newCount}</div>
                <div style={S.kpiLabel}>New Today</div>
              </div>
            </div>
            <button style={S.scrapeBtn} onClick={handleScrape} disabled={scraping}>
              {scraping ? '⏳ Scraping...' : '🔄 Sync Jobs'}
            </button>
          </div>
        </div>

        {activeQuickFilter && (
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#475569' }}>Filtering by:</span>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: '#a5b4fc',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {QUICK_FILTERS.find(f => f.key === activeQuickFilter)?.label}
            </span>
            <span style={{ fontSize: '12px', color: '#475569', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setActiveQuickFilter('')}>Clear</span>
          </div>
        )}

        <div style={S.searchRow}>
          <div style={S.searchWrap}>
            <span style={{ fontSize: '14px', color: '#1e3a5f' }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, skill, or keyword..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#94a3b8', width: '100%' }}
            />
          </div>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ ...S.dropdown, maxWidth: '180px' }}>
            <option value="">📍 All Locations</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={S.dropdown}>
            <option value="newest">↓ Newest First</option>
            <option value="oldest">↑ Oldest First</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#334155', padding: '80px 0' }}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: '#475569', fontSize: '15px' }}>No jobs found</p>
            <p style={{ color: '#1e3a5f', fontSize: '13px', marginTop: '6px' }}>Try adjusting your filters or click Scrape Now</p>
          </div>
        ) : (
          <>
            <div style={S.tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Company', 'Role', 'Location', 'Posted', 'Date', 'Actions'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, i) => {
                    const co = getCompanyStyle(job.company)
                    const isNew = isNewJob(job.posted_at)
                    const isSaved = savedJobIds.has(job.id)
                    const isApplied = appliedJobIds.has(job.id)
                    return (
                      <tr
                        key={job.id}
                        onMouseEnter={() => setHoveredRow(i)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: i < filteredJobs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
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
                        <td style={{ ...S.td, fontSize: '12px', color: '#475569' }}>
                          {job.posted_at ? new Date(job.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button style={S.saveBtn(isSaved)} onClick={() => toggleSave(job.id)}>
                              {isSaved ? '✅ Saved' : '🔖 Save'}
                            </button>
                            <button style={S.appliedBtn(isApplied)} onClick={() => toggleApplied(job.id)}>
                              {isApplied ? '✓ Applied' : 'Applied?'}
                            </button>
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

            {total > LIMIT && !activeQuickFilter && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
                <button style={S.pageBtn(offset === 0)} disabled={offset === 0} onClick={() => fetchJobs(offset - LIMIT)}>← Prev</button>
                <span style={{ fontSize: 13, color: '#475569' }}>
                  {offset + 1}–{Math.min(offset + LIMIT, total)} of {total.toLocaleString()} jobs
                </span>
                <button style={S.pageBtn(offset + LIMIT >= total)} disabled={offset + LIMIT >= total} onClick={() => fetchJobs(offset + LIMIT)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default JobsPage