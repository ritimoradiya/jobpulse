import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageBackground from './components/PageBackground'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AlertsPage from './pages/AlertsPage'
import SavedJobsPage from './pages/SavedJobsPage'

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
        </Routes>
      </div>
    </>
  )
}

export default App