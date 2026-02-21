import { Routes, Route } from 'react-router-dom'
import JobsPage from './pages/JobsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Routes>
        <Route path="/" element={<JobsPage />} />
      </Routes>
    </div>
  )
}

export default App