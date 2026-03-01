import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { label: 'Jobs',      path: '/jobs' },
    { label: 'Saved',     path: '/saved' },
    { label: 'Applied',   path: '/applied' },
    { label: 'AI Match',  path: '/ai' },
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
        <Link to="/jobs" style={{
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
        <Link to="/alerts" style={{
          position: 'relative', width: '36px', height: '36px',
          borderRadius: '9px',
          background: isActive('/alerts') ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
          border: isActive('/alerts') ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}>
          🔔
        </Link>

        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: 'white',
                border: '2px solid rgba(139,92,246,0.3)',
                cursor: 'pointer', userSelect: 'none',
                transition: 'border-color 0.2s',
                ...(dropdownOpen && { borderColor: 'rgba(139,92,246,0.6)' }),
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '44px', right: 0,
                width: '220px',
                background: 'rgba(10,10,20,0.98)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                zIndex: 200,
              }}>
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{user.email}</div>
                </div>

                {[{ label: 'Edit Profile', action: () => { navigate('/profile'); setDropdownOpen(false) } }].map(item => (
                  <div
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', cursor: 'pointer',
                      fontSize: '13px', color: '#94a3b8',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
                  >
                    {item.label}
                  </div>
                ))}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div
                    onClick={() => { logout(); navigate('/login'); setDropdownOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 16px', cursor: 'pointer',
                      fontSize: '13px', color: '#ef4444',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Logout
                  </div>
                </div>
              </div>
            )}
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
    </nav>
  )
}

export default Navbar