import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TABS = ['Login & Security']

export default function ProfilePage() {
  const { user, token, logout, login } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Login & Security')

  // Email form
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' })
  const [emailLoading, setEmailLoading] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Delete form
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMsg, setDeleteMsg] = useState({ type: '', text: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const handleUpdateEmail = async () => {
    setEmailMsg({ type: '', text: '' })
    if (!newEmail || !emailPassword)
      return setEmailMsg({ type: 'error', text: 'All fields are required' })
    setEmailLoading(true)
    try {
      await api.put('/auth/update-email', { newEmail, password: emailPassword }, authHeaders)
      login(token, { ...user, email: newEmail })
      setEmailMsg({ type: 'success', text: 'Email updated successfully' })
      setNewEmail('')
      setEmailPassword('')
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update email' })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordMsg({ type: '', text: '' })
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordMsg({ type: 'error', text: 'All fields are required' })
    if (newPassword !== confirmPassword)
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
    if (newPassword.length < 6)
      return setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' })
    setPasswordLoading(true)
    try {
      await api.put('/auth/update-password', { currentPassword, newPassword }, authHeaders)
      setPasswordMsg({ type: 'success', text: 'Password updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteMsg({ type: '', text: '' })
    if (!deletePassword)
      return setDeleteMsg({ type: 'error', text: 'Password is required' })
    setDeleteLoading(true)
    try {
      await api.delete('/auth/delete-account', {
        ...authHeaders,
        data: { password: deletePassword }
      })
      logout()
      navigate('/login')
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete account' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  }

  const btnStyle = (danger) => ({
    padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', border: 'none', color: '#fff', transition: 'opacity 0.2s',
    background: danger
      ? 'rgba(239,68,68,0.15)'
      : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    border: danger ? '1px solid rgba(239,68,68,0.3)' : 'none',
    color: danger ? '#ef4444' : '#fff',
  })

  const msgStyle = (type) => ({
    fontSize: '12px', padding: '9px 12px', borderRadius: '8px', marginBottom: '12px',
    background: type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
    color: type === 'error' ? '#ef4444' : '#4ade80',
  })

  const divider = <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '28px 0' }} />

  const label = (text) => (
    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>{text}</div>
  )

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <div style={{
        width: '220px', flexShrink: 0, padding: '32px 12px',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(4,4,10,0.6)',
      }}>
        {TABS.map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 14px', borderRadius: '8px', fontSize: '13px',
              cursor: 'pointer', marginBottom: '2px', transition: 'all 0.15s',
              color: activeTab === tab ? '#a5b4fc' : '#475569',
              background: activeTab === tab ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: activeTab === tab ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, padding: '40px 48px', maxWidth: '640px' }}>
        <h2 style={{
          fontSize: '20px', fontWeight: 700, color: '#f1f5f9',
          letterSpacing: '-0.5px', marginBottom: '32px',
        }}>
          {activeTab}
        </h2>

        {/* Current Info */}
        <div style={{ marginBottom: '6px' }}>
          {label('Name')}
          <div style={{ ...inputStyle, color: '#475569', cursor: 'default' }}>{user?.name}</div>
        </div>

        {divider}

        {/* Change Email */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>Email</div>
          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>{user?.email}</div>

          {emailMsg.text && <div style={msgStyle(emailMsg.type)}>{emailMsg.text}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {label('New Email')}
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="Enter new email" type="email" style={inputStyle} />
            {label('Current Password')}
            <input value={emailPassword} onChange={e => setEmailPassword(e.target.value)}
              placeholder="Confirm with your password" type="password" style={inputStyle} />
            <div>
              <button onClick={handleUpdateEmail} disabled={emailLoading} style={btnStyle(false)}>
                {emailLoading ? 'Updating...' : 'Update Email'}
              </button>
            </div>
          </div>
        </div>

        {divider}

        {/* Change Password */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '16px' }}>Password</div>

          {passwordMsg.text && <div style={msgStyle(passwordMsg.type)}>{passwordMsg.text}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {label('Current Password')}
            <input value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter current password" type="password" style={inputStyle} />
            {label('New Password')}
            <input value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password" type="password" style={inputStyle} />
            {label('Confirm New Password')}
            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password" type="password" style={inputStyle} />
            <div>
              <button onClick={handleUpdatePassword} disabled={passwordLoading} style={btnStyle(false)}>
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {divider}

        {/* Delete Account */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
            Delete Account
          </div>
          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
            Permanently delete your account and all associated data.
          </div>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={btnStyle(true)}>
              Delete my account
            </button>
          ) : (
            <div style={{
              padding: '20px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
            }}>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
                This action is irreversible. Enter your password to confirm.
              </div>
              {deleteMsg.text && <div style={msgStyle(deleteMsg.type)}>{deleteMsg.text}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Enter your password" type="password" style={inputStyle} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleDeleteAccount} disabled={deleteLoading} style={btnStyle(true)}>
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteMsg({ type: '', text: '' }) }}
                    style={{
                      padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
                      fontWeight: 600, cursor: 'pointer',
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#475569',
                    }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}