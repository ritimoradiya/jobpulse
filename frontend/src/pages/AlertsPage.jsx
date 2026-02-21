import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">JobPulse</span>
          <span className="text-xl">⚡</span>
        </Link>
        <Link to="/" className="text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-2 rounded-lg transition-colors">
          ← Back to Jobs
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Alerts</h1>
            <p className="text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-blue-400 hover:text-blue-300 border border-blue-800 px-3 py-2 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔔</p>
            <p className="text-gray-400 text-lg">No alerts yet</p>
            <p className="text-gray-600 text-sm mt-2">You'll be notified when new jobs are detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => !alert.is_read && markAsRead(alert.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  alert.is_read
                    ? 'bg-gray-900 border-gray-800 opacity-60'
                    : 'bg-gray-900 border-blue-700 hover:border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">
                      {alert.alert_type === 'new_job' ? '🆕' : '🔔'}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{alert.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(alert.created_at || alert.sent_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!alert.is_read && (
                    <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsPage