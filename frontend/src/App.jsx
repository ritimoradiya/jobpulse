import { Routes, Route } from 'react-router-dom'
import JobsPage from './pages/JobsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AlertsPage from './pages/AlertsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Routes>
        <Route path="/" element={<JobsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Routes>
    </div>
  )
}

export default App