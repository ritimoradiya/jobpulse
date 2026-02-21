import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import AlertBell from '../components/AlertBell'

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const fetchJobs = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (filterCompany) params.company = filterCompany
      if (filterLocation) params.location = filterLocation
      const res = await api.get('/jobs', { params })
      setJobs(res.data.jobs || res.data || [])
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleScrape = async () => {
    setScraping(true)
    try {
      await api.post('/jobs/scrape')
      await fetchJobs()
    } catch (err) {
      console.error('Scrape failed:', err)
    } finally {
      setScraping(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [search, filterCompany, filterLocation])

  const companies = [...new Set(jobs.map(j => j.company).filter(Boolean))]
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">JobPulse</span>
          <span className="text-xl">⚡</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{jobs.length} jobs tracked</span>
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {scraping ? 'Scraping...' : '🔄 Scrape Now'}
          </button>
          <AlertBell />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-sm">👋 {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-gray-400 hover:text-white text-sm border border-gray-700 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Job Listings</h1>
          <p className="text-gray-400 mt-1">Real-time jobs from company career portals — updated every 6 hours</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Search by title or keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          {(search || filterCompany || filterLocation) && (
            <button
              onClick={() => { setSearch(''); setFilterCompany(''); setFilterLocation('') }}
              className="text-gray-400 hover:text-white text-sm px-3 py-2 border border-gray-700 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No jobs found.</p>
            <p className="text-gray-600 text-sm mt-2">Try clicking "Scrape Now" to fetch the latest jobs.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl p-5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">
                        {job.company || 'Unknown'}
                      </span>
                      {job.is_active === false && (
                        <span className="text-xs font-medium bg-red-900 text-red-300 px-2 py-0.5 rounded-full">Removed</span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-white mt-1">{job.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      {job.location && <span>📍 {job.location}</span>}
                      {job.posted_at && (
                        <span>🕐 {new Date(job.posted_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      Apply →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobsPage