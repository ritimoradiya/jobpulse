import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

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

function getCompanyStyle(name) {
  return COMPANIES.find(c => c.name === name) || { color: '#818cf8', bg: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }
}

function AppliedPage() {
  const { token } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const fetchApplied = async () => {
    try {
      const res = await api.get('/applied', authHeaders)
      setJobs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const removeApplied = async (jobId) => {
    try {
      await api.delete(`/applied/${jobId}`, authHeaders)
      setJobs(prev => prev.filter(j => j.job_id !== jobId))
    } catch (err) {
      console.error('Failed to remove applied:', err)
    }
  }

  useEffect(() => {
    if (token) fetchApplied()
  }, [token])

  const th = {
    padding: '12px 18px', textAlign: 'left',
    fontSize: '11px', fontWeight: 600, color: '#1e3a5f',
    textTransform: 'uppercase', letterSpacing: '1px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }
  const td = { padding: '14px 18px', verticalAlign: 'middle' }

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontSize: '24px', fontWeight: 900, letterSpacing: '-0.8px', marginBottom: '5px',
          background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Applied Jobs</h1>
        <p style={{ fontSize: '13px', color: '#334155' }}>
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} you've applied to
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#334155', padding: '80px 0', fontSize: '13px' }}>Loading...</div>
      ) : jobs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          border: '1px solid rgba(255,255,255,0.04)', borderRadius: '14px'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📋</div>
          <p style={{ color: '#475569', fontSize: '15px', marginBottom: '6px' }}>No applications yet</p>
          <p style={{ color: '#1e3a5f', fontSize: '13px' }}>Mark jobs as Applied from the Jobs page to track them here</p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(8,8,18,0.6)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(10px)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Company', 'Role', 'Location', 'Applied On', 'Actions'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => {
                const co = getCompanyStyle(job.company)
                return (
                  <tr key={job.id} style={{
                    borderBottom: i < jobs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: 800, color: 'white',
                          background: co.bg, border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                          {(job.company || '?').charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{job.company}</div>
                          <div style={{ fontSize: '11px', color: '#1e3a5f' }}>{job.source || 'career portal'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>{job.title}</span>
                    </td>
                    <td style={{ ...td, fontSize: '12px', color: '#475569' }}>
                      📍 {job.location || 'N/A'}
                    </td>
                    <td style={{ ...td, fontSize: '12px', color: '#475569' }}>
                      {new Date(job.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{
                          padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          color: 'white', textDecoration: 'none', display: 'inline-block',
                        }}>
                          View →
                        </a>
                        <button onClick={() => removeApplied(job.job_id)} style={{
                          padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontWeight: 500,
                          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)',
                          color: '#f87171', cursor: 'pointer',
                        }}>
                          Remove
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
  )
}

export default AppliedPage