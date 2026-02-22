import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const COMPANY_STYLES = {
  Google:    { bg: 'linear-gradient(135deg,#4285f4,#1a73e8)' },
  Meta:      { bg: 'linear-gradient(135deg,#1877f2,#0a52cc)' },
  Amazon:    { bg: 'linear-gradient(135deg,#ff9900,#cc7700)' },
  Microsoft: { bg: 'linear-gradient(135deg,#00a1f1,#0078d4)' },
  Apple:     { bg: 'linear-gradient(135deg,#888,#555)' },
  Stripe:    { bg: 'linear-gradient(135deg,#635bff,#4f46e5)' },
  Netflix:   { bg: 'linear-gradient(135deg,#e50914,#b20710)' },
}

function getCompanyBg(name) {
  return COMPANY_STYLES[name]?.bg || 'linear-gradient(135deg,#4f46e5,#7c3aed)'
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Date.now() - new Date(date)
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 1) return 'Just now'
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredRow, setHoveredRow] = useState(null)
  const { token } = useAuth()

  const fetchSaved = async () => {
    try {
      const res = await api.get('/tracked', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data
      const list = Array.isArray(data) ? data : (data.tracked || data.jobs || [])
      setSavedJobs(list)
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeJob = async (jobId) => {
    try {
      await api.delete(`/tracked/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSavedJobs(prev => prev.filter(j => (j.job_id || j.id) !== jobId))
    } catch (err) {
      console.error('Failed to remove job:', err)
    }
  }

  useEffect(() => {
    if (token) fetchSaved()
  }, [token])

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
      {/* Main */}
      <div style={{ flex: 1, padding: '36px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{
              fontSize: '24px', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '5px',
              background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Saved Jobs</h1>
            <p style={{ fontSize: '13px', color: '#334155' }}>
              {savedJobs.length > 0 ? `${savedJobs.length} job${savedJobs.length > 1 ? 's' : ''} saved` : 'No saved jobs yet'}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#334155', padding: '80px 0', fontSize: '13px' }}>
            Loading saved jobs...
          </div>
        ) : savedJobs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            background: 'rgba(8,8,18,0.6)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '14px' }}>🔖</div>
            <p style={{ color: '#475569', fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>No saved jobs yet</p>
            <p style={{ color: '#1e3a5f', fontSize: '13px' }}>Click "Save" on any job to track it here</p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(8,8,18,0.6)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(10px)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Company', 'Role', 'Location', 'Posted', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 18px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#1e3a5f',
                      textTransform: 'uppercase', letterSpacing: '1px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {savedJobs.map((item, i) => {
                  const job = {
                    title: item.title,
                    company: item.company,
                    location: item.location,
                    url: item.url,
                    source: item.source,
                    posted_at: item.posted_at,
                  }
                  const jobId = item.job_id
                  return (
                    <tr
                      key={jobId}
                      onMouseEnter={() => setHoveredRow(i)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: i < savedJobs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                        background: hoveredRow === i ? 'rgba(99,102,241,0.04)' : 'transparent',
                        transition: 'background 0.18s ease',
                      }}
                    >
                      {/* Company */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 800, color: 'white',
                            background: getCompanyBg(job.company),
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'transform 0.2s ease',
                            transform: hoveredRow === i ? 'scale(1.06)' : 'scale(1)',
                          }}>
                            {(job.company || '?').charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{job.company || 'Unknown'}</div>
                            <div style={{ fontSize: '11px', color: '#1e3a5f' }}>{job.source || 'career portal'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>
                        {job.title}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', fontSize: '12px', color: '#475569' }}>
                        📍 {job.location || 'N/A'}
                      </td>

                      {/* Posted */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', fontSize: '12px', color: '#1e3a5f' }}>
                        {timeAgo(job.posted_at)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {job.url && (
                            <a
                              href={job.url} target="_blank" rel="noopener noreferrer"
                              style={{
                                padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: 'white', textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              Apply →
                            </a>
                          )}
                          <button
                            onClick={() => removeJob(jobId)}
                            style={{
                              padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 500,
                              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#f87171', cursor: 'pointer', transition: 'all 0.18s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                          >
                            ✕ Remove
                          </button>
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

export default SavedJobsPage