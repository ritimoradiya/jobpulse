import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const CONDITIONS = [
  { label: 'At least 8 characters', test: p => p.length >= 8 },
  { label: 'One uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'One number', test: p => /[0-9]/.test(p) },
  { label: 'One special character (!@#$...)', test: p => /[^A-Za-z0-9]/.test(p) },
]

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const allConditionsMet = CONDITIONS.every(c => c.test(password))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!allConditionsMet) { setError('Password does not meet all requirements'); return }
    if (!passwordsMatch) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { name, email, password })
      login(res.data.token, res.data.user)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(15,15,25,0.8)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px',
    padding: '11px 14px', fontSize: '13px', color: '#e2e8f0',
    outline: 'none', transition: 'border-color 0.2s',
  }
  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: '#475569', marginBottom: '7px',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '28px', fontWeight: 900, letterSpacing: '-0.8px',
            background: 'linear-gradient(135deg, #818cf8, #c084fc, #60a5fa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
          }}>JobPulse ⚡</div>
        </div>

        <div style={{
          background: 'rgba(8,8,18,0.8)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '32px', backdropFilter: 'blur(20px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(192,132,252,0.5), transparent)',
          }} />

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '13px', color: '#f87171', marginBottom: '20px',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                required placeholder="John Doe" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Create password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(129,140,248,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Password conditions */}
            {password.length > 0 && (
              <div style={{
                background: 'rgba(15,15,25,0.6)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
                display: 'flex', flexDirection: 'column', gap: '7px',
              }}>
                {CONDITIONS.map(c => {
                  const met = c.test(password)
                  return (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700, transition: 'all 0.2s ease',
                        background: met ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                        border: met ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        color: met ? '#4ade80' : '#334155',
                      }}>
                        {met ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: '11px', color: met ? '#4ade80' : '#334155', transition: 'color 0.2s' }}>
                        {c.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Confirm password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                required placeholder="••••••••"
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword.length > 0
                    ? passwordsMatch ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'
                    : 'rgba(255,255,255,0.08)',
                }}
                onFocus={e => {
                  if (!confirmPassword.length) e.target.style.borderColor = 'rgba(129,140,248,0.4)'
                }}
                onBlur={e => {
                  if (!confirmPassword.length) e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              />
              {confirmPassword.length > 0 && (
                <div style={{ fontSize: '11px', marginTop: '6px', color: passwordsMatch ? '#4ade80' : '#f87171' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px',
              background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white', fontSize: '14px', fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 20px rgba(99,102,241,0.3)',
              transition: 'all 0.2s ease',
            }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#334155' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage