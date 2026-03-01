import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const COMPANIES = [
  'Google', 'Netflix', 'Airbnb', 'Nvidia',
  'Salesforce', 'Adobe', 'Fidelity', 'Athena Health'
]

function AlertsPage() {
  const { token, user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(true)
  const [email, setEmail] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts', authHeaders)
      setAlerts(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setLoadingAlerts(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAlerts()
      if (user?.email) setEmail(user.email)
    }
  }, [token])

  const toggleCompany = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
    )
  }

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (!trimmed) return
    const newKws = trimmed.split(',').map(k => k.trim()).filter(k => k && !keywords.includes(k))
    setKeywords(prev => [...prev, ...newKws])
    setKeywordInput('')
  }

  const removeKeyword = (kw) => setKeywords(prev => prev.filter(k => k !== kw))

  const handleSubmit = async () => {
    setFormError('')
    setSuccessMsg('')
    if (!email) return setFormError('Email is required')
    if (!selectedCompanies.length && !keywords.length)
      return setFormError('Select at least one company or add a keyword')
    setSubmitting(true)
    try {
      const res = await api.post('/alerts', { email, companies: selectedCompanies, keywords }, authHeaders)
      setAlerts(prev => [res.data, ...prev])
      setSelectedCompanies([])
      setKeywords([])
      setSuccessMsg("Alert created! You'll receive emails when matching jobs are detected.")
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create alert')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteAlert = async (id) => {
    const cleanId = parseInt(id, 10)
    try {
      await api.delete(`/alerts/${cleanId}`, authHeaders)
      setAlerts(prev => prev.filter(a => parseInt(a.id, 10) !== cleanId))
    } catch (err) {
      console.error('Failed to delete alert:', err)
    }
  }

  const toggleAlert = async (id) => {
    const cleanId = parseInt(id, 10)
    try {
      const res = await api.patch(`/alerts/${cleanId}/toggle`, {}, authHeaders)
      setAlerts(prev => prev.map(a => parseInt(a.id, 10) === cleanId ? res.data : a))
    } catch (err) {
      console.error('Failed to toggle alert:', err)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a12',
      color: '#e2e8f0', fontFamily: 'Inter, sans-serif',
      padding: '40px 48px', maxWidth: '900px', margin: '0 auto'
    }}>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
      <h1 style={{fontSize: '22px', fontWeight: 700, color: '#f1f5f9',
      letterSpacing: '-0.5px', marginBottom: '6px',
      display: 'flex', alignItems: 'center', gap: '10px'
      }}>🔔 Email Alerts</h1>
      </div>

      {/* Create Alert Form */}
      <div style={{
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
        padding: '28px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{
          fontSize: '11px', fontWeight: 600, color: '#475569',
          letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '20px'
        }}>
          Create New Alert
        </div>

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Notification Email
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Companies */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
            Companies
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {COMPANIES.map(c => (
              <button key={c} onClick={() => toggleCompany(c)} style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: selectedCompanies.includes(c) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                border: selectedCompanies.includes(c) ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                color: selectedCompanies.includes(c) ? '#a5b4fc' : '#64748b',
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Job Title Keywords
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={keywordInput} onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKeyword()}
              placeholder="e.g. Software Engineer, Data Scientist"
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0', fontSize: '13px', outline: 'none'
              }}
            />
            <button onClick={addKeyword} style={{
              padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8'
            }}>
              Add
            </button>
          </div>
          {keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {keywords.map(kw => (
                <span key={kw} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px',
                  borderRadius: '20px', fontSize: '12px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc'
                }}>
                  {kw}
                  <span onClick={() => removeKeyword(kw)}
                    style={{ cursor: 'pointer', color: '#475569', fontSize: '11px', fontWeight: 700 }}>✕</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {formError && (
          <div style={{
            fontSize: '12px', color: '#f87171', padding: '10px 12px', borderRadius: '8px',
            background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)', marginBottom: '14px'
          }}>{formError}</div>
        )}
        {successMsg && (
          <div style={{
            fontSize: '12px', color: '#4ade80', padding: '10px 12px', borderRadius: '8px',
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.12)', marginBottom: '14px'
          }}>✓ {successMsg}</div>
        )}

        <button onClick={handleSubmit} disabled={submitting} style={{
          width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px',
          fontWeight: 600, cursor: 'pointer', border: 'none', color: '#fff',
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
          opacity: submitting ? 0.6 : 1, transition: 'opacity 0.2s'
        }}>
          {submitting ? 'Creating...' : '🔔 Create Alert'}
        </button>
      </div>

      {/* Alerts Table */}
      <div style={{
        fontSize: '11px', fontWeight: 600, color: '#475569',
        letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '14px'
      }}>
        Your Alerts ({alerts.length})
      </div>

      {loadingAlerts ? (
        <div style={{ color: '#334155', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>Loading...</div>
      ) : alerts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0', color: '#334155', fontSize: '13px',
          border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px'
        }}>
          No alerts yet. Create one above to start receiving email notifications.
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 180px 120px',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            {['Companies', 'Keywords', 'Email', 'Status'].map(h => (
              <div key={h} style={{
                fontSize: '11px', fontWeight: 600, color: '#334155',
                letterSpacing: '0.6px', textTransform: 'uppercase'
              }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {alerts.map((alert, i) => (
            <div
              key={String(alert.id)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 180px 120px',
                padding: '14px 20px', alignItems: 'center',
                borderBottom: i < alerts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Companies */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {alert.companies?.length > 0
                  ? alert.companies.map(c => (
                    <span key={c} style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                      background: 'rgba(98,142,203,0.1)', border: '1px solid rgba(98,142,203,0.15)',
                      color: '#628ECB'
                    }}>{c}</span>
                  ))
                  : <span style={{ fontSize: '12px', color: '#334155' }}>Any</span>
                }
              </div>

              {/* Keywords */}
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {alert.keywords?.length > 0 ? alert.keywords.join(', ') : '—'}
              </div>

              {/* Email */}
              <div style={{
                fontSize: '12px', color: '#64748b',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {alert.email}
              </div>

              {/* Status + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  onClick={() => toggleAlert(alert.id)}
                  style={{
                    fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                    cursor: 'pointer', userSelect: 'none',
                    background: alert.is_active ? 'rgba(74,222,128,0.08)' : 'rgba(100,116,139,0.08)',
                    border: alert.is_active ? '1px solid rgba(74,222,128,0.15)' : '1px solid rgba(100,116,139,0.12)',
                    color: alert.is_active ? '#4ade80' : '#475569',
                  }}
                >
                  {alert.is_active ? 'Active' : 'Paused'}
                </span>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                    fontWeight: 600, cursor: 'pointer',
                    background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.12)',
                    color: '#f87171'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertsPage