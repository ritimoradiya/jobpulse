import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PageBackground from './components/PageBackground'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AlertsPage from './pages/AlertsPage'

function App() {
  return (
    <>
      <PageBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<JobsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </div>
    </>
  )
}

export default App