import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function AlertBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const { token } = useAuth()

  const fetchUnread = async () => {
    if (!token) return
    try {
      const res = await api.get('/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = res.data
      const alerts = Array.isArray(data) ? data : (data.alerts || data.data || [])
      setUnreadCount(alerts.filter(a => !a.is_read).length)
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    }
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [token])

  if (!token) return null

  return (
    <Link to="/alerts" className="relative p-2 text-gray-400 hover:text-white transition-colors">
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

export default AlertBell