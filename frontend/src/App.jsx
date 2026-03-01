import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageBackground from './components/PageBackground'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AlertsPage from './pages/AlertsPage'
import SavedJobsPage from './pages/SavedJobsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AppliedPage from './pages/AppliedPage'
import AIPage from './pages/AIPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const location = useLocation()
  const hideNav = ['/login', '/register'].includes(location.pathname)

  return (
    <>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {!hideNav && <Navbar />}
        <Routes>
          <Route path="/" element={<JobsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/applied" element={<AppliedPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  )
}

export default App