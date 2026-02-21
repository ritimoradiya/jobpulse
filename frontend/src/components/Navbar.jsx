import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { label: 'Jobs', path: '/' },
    { label: 'Saved', path: '/saved' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Analytics', path: '/analytics' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: '60px',
      background: 'rgba(4,4,10,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      backdropFilter: 'blur(24px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link to="/" style={{
          fontSize: '18px', fontWeight: 900, letterSpacing: '-0.8px',
          background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}>
          JobPulse ⚡
        </Link>

        <div style={{ display: 'flex', gap: '2px' }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 500,
                color: isActive(link.path) ? '#e2e8f0' : '#475569',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
                background: isActive(link.path) ? 'rgba(255,255,255,0.04)' : 'transparent',
              }}
            >
              {link.label}
              {isActive(link.path) && (
                <span style={{
                  position: 'absolute', bottom: '-1px', left: '14px', right: '14px',
                  height: '2px',
                  background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                  borderRadius: '2px',
                }} />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Live pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
          padding: '5px 12px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, color: '#4ade80',
        }}>
          <span style={{
            width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%',
            boxShadow: '0 0 8px #22c55e',
            animation: 'pulse-dot 2s ease infinite',
            display: 'inline-block',
          }} />
          Live
        </div>

        {/* Bell */}
        <Link to="/alerts" style={{
          position: 'relative', width: '36px', height: '36px',
          borderRadius: '9px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}>
          🔔
        </Link>

        {/* User */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: 'white',
              border: '2px solid rgba(139,92,246,0.3)',
              cursor: 'default',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#475569', fontSize: '12px', fontWeight: 500,
              padding: '6px 14px', borderRadius: '8px',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white', fontSize: '12px', fontWeight: 600,
            padding: '7px 16px', borderRadius: '9px',
            textDecoration: 'none', transition: 'all 0.2s ease',
            boxShadow: '0 0 20px rgba(99,102,241,0.25)',
          }}>
            Sign In
          </Link>
        )}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </nav>
  )
}

export default Navbar