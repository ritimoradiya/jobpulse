import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data
      const alertList = Array.isArray(data) ? data : (data.alerts || data.data || [])
      setAlerts(alertList)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.is_read)
    await Promise.all(unread.map(a => markAsRead(a.id)))
  }

  useEffect(() => {
    if (token) fetchAlerts()
  }, [token])

  const unreadCount = alerts.filter(a => !a.is_read).length

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{
            fontSize: '24px', fontWeight: 900, letterSpacing: '-0.8px',
            background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '5px',
          }}>Alerts</h1>
          <p style={{ fontSize: '13px', color: '#334155' }}>
            {unreadCount > 0 ? `${unreadCount} unread — real-time job change notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{
            fontSize: '12px', color: '#818cf8',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
            padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#334155', padding: '80px 0' }}>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
          <p style={{ color: '#475569', fontSize: '15px', marginBottom: '6px' }}>No alerts yet</p>
          <p style={{ color: '#1e3a5f', fontSize: '13px' }}>You'll be notified when new jobs are detected</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => !alert.is_read && markAsRead(alert.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px', borderRadius: '12px',
                background: 'rgba(8,8,18,0.7)',
                border: alert.is_read ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(99,102,241,0.2)',
                cursor: alert.is_read ? 'default' : 'pointer',
                opacity: alert.is_read ? 0.4 : 1,
                transition: 'all 0.18s ease',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Left accent bar */}
              <span style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                background: alert.is_read ? '#334155' : 'linear-gradient(180deg, #818cf8, #c084fc)',
                borderRadius: '3px 0 0 3px',
              }} />

              {/* Icon */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                background: alert.is_read ? 'rgba(51,65,85,0.3)' : 'rgba(99,102,241,0.1)',
                border: alert.is_read ? '1px solid rgba(51,65,85,0.2)' : '1px solid rgba(99,102,241,0.2)',
              }}>
                {alert.alert_type === 'new_job' ? '🆕' : '🔔'}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0', marginBottom: '3px' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: '11px', color: '#334155' }}>
                  {new Date(alert.created_at || alert.sent_at).toLocaleString()}
                </div>
              </div>

              {/* Unread dot */}
              {!alert.is_read && (
                <div style={{
                  width: '8px', height: '8px', background: '#818cf8', borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(129,140,248,0.5)', flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertsPage