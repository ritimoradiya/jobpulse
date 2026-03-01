import { useState, useRef } from 'react'

// ─── DSA #2: Min-Heap for ranking multiple job scores ─────────────────────────
class MinHeap {
  constructor() { this.heap = [] }
  push(item) {
    this.heap.push(item)
    this._bubbleUp(this.heap.length - 1)
  }
  pop() {
    const top = this.heap[0]
    const last = this.heap.pop()
    if (this.heap.length > 0) {
      this.heap[0] = last
      this._sinkDown(0)
    }
    return top
  }
  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (this.heap[parent].score <= this.heap[i].score) break
      ;[this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]]
      i = parent
    }
  }
  _sinkDown(i) {
    const n = this.heap.length
    while (true) {
      let smallest = i
      const l = 2 * i + 1, r = 2 * i + 2
      if (l < n && this.heap[l].score < this.heap[smallest].score) smallest = l
      if (r < n && this.heap[r].score < this.heap[smallest].score) smallest = r
      if (smallest === i) break
      ;[this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]]
      i = smallest
    }
  }
  getTopN(n) {
    const copy = new MinHeap()
    copy.heap = [...this.heap]
    const result = []
    while (result.length < n && copy.heap.length > 0) result.push(copy.pop())
    return result.reverse() // highest first
  }
}

const jobHeap = new MinHeap()

// ─── Score Ring Component ──────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? '#22c55e' : score >= 45 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 32, fontWeight: 800, color, letterSpacing: '-1px' }}>{score}</span>
        <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>/ 100</span>
      </div>
    </div>
  )
}

// ─── Breakdown Bar ─────────────────────────────────────────────────────────────
function BreakdownBar({ label, value }) {
  const color = value >= 70 ? '#22c55e' : value >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{
          height: '100%', borderRadius: 99, background: color,
          width: `${value}%`, transition: 'width 1s ease',
        }} />
      </div>
    </div>
  )
}

export default function AIPage() {
  const [resumeMode, setResumeMode] = useState('paste') // 'paste' | 'upload'
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)

    // Use pdfjs-dist to extract text
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)
    GlobalWorkerOptions.workerSrc = workerUrl.toString()

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const pdf = await getDocument({ data: ev.target.result }).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(s => s.str).join(' ') + '\n'
        }
        setResumeText(text)
      } catch {
        setError('Failed to extract PDF text. Try pasting instead.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume and job description.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/ai/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ resumeText, jobDescription }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to analyze')

      // DSA #2: push to min-heap for ranking
      jobHeap.push({ score: data.score, timestamp: Date.now(), result: data })

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const scoreLabel = result
    ? result.score >= 70 ? 'Strong Match' : result.score >= 45 ? 'Partial Match' : 'Weak Match'
    : ''
  const scoreLabelColor = result
    ? result.score >= 70 ? '#22c55e' : result.score >= 45 ? '#f59e0b' : '#ef4444'
    : ''

  return (
    <div style={{ minHeight: '100vh', padding: '40px 48px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, letterSpacing: '-0.8px',
          background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          AI Resume Matcher
        </h1>

      </div>

      {/* Input Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Left — Resume */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Resume</span>
            {/* Toggle */}
            <div style={{
              display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)',
              borderRadius: 8, padding: 3,
            }}>
              {['paste', 'upload'].map(mode => (
                <button key={mode} onClick={() => { setResumeMode(mode); setFileName(''); setResumeText('') }}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500,
                    background: resumeMode === mode ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: resumeMode === mode ? '#818cf8' : '#475569',
                    transition: 'all 0.2s',
                  }}>
                  {mode === 'paste' ? 'Paste Text' : 'Upload PDF'}
                </button>
              ))}
            </div>
          </div>

          {resumeMode === 'paste' ? (
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here..."
              style={{
                width: '100%', height: 320, resize: 'none',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: 14, color: '#e2e8f0', fontSize: 13,
                lineHeight: 1.6, outline: 'none', boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          ) : (
            <div
              onClick={() => fileRef.current.click()}
              style={{
                height: 320, border: '1.5px dashed rgba(99,102,241,0.3)',
                borderRadius: 10, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s', gap: 12,
                background: 'rgba(99,102,241,0.03)',
              }}
            >
              <span style={{ fontSize: 36 }}>📄</span>
              {fileName ? (
                <>
                  <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>{fileName}</span>
                  <span style={{ fontSize: 12, color: '#22c55e' }}>✓ Text extracted</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 13, color: '#475569' }}>Click to upload PDF</span>
                  <span style={{ fontSize: 11, color: '#334155' }}>Text is extracted locally</span>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                onChange={handleFileUpload} />
            </div>
          )}
        </div>

        {/* Right — Job Description */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 24,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', display: 'block', marginBottom: 16 }}>
            Job Description
          </span>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            style={{
              width: '100%', height: 320, resize: 'none',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: 14, color: '#e2e8f0', fontSize: 13,
              lineHeight: 1.6, outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          color: '#ef4444', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Analyze Button */}
      <button onClick={handleAnalyze} disabled={loading} style={{
        width: '100%', padding: '14px',
        background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        border: 'none', borderRadius: 12, color: 'white',
        fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s', letterSpacing: '0.2px',
        boxShadow: loading ? 'none' : '0 0 30px rgba(99,102,241,0.3)',
        marginBottom: 32,
      }}>
        {loading ? 'Analyzing with Claude...' : 'Analyze Resume'}
      </button>

      {/* Results */}
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>

          {/* Score Card */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <ScoreRing score={result.score} />
            <span style={{ fontSize: 13, fontWeight: 700, color: scoreLabelColor }}>{scoreLabel}</span>

            {/* Breakdown */}
            {result.breakdown && (
              <div style={{ width: '100%', marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#334155', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Breakdown
                </div>
                <BreakdownBar label="Keyword Match" value={result.breakdown.keywordMatch} />
                <BreakdownBar label="Experience" value={result.breakdown.experienceRelevance} />
                <BreakdownBar label="Achievements" value={result.breakdown.achievementQuality} />
                <BreakdownBar label="Title Alignment" value={result.breakdown.titleAlignment} />
              </div>
            )}
          </div>

          {/* Skills + Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Matched Skills */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', marginBottom: 12 }}>
                ✓ Matched Skills ({result.matchedSkills.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.matchedSkills.map(skill => (
                  <span key={skill} style={{
                    padding: '4px 12px', borderRadius: 99,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    color: '#22c55e', fontSize: 12, fontWeight: 500,
                  }}>{skill}</span>
                ))}
                {result.matchedSkills.length === 0 && (
                  <span style={{ color: '#334155', fontSize: 13 }}>No matched skills found</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 12 }}>
                ✗ Missing Skills ({result.missingSkills.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.missingSkills.map(skill => (
                  <span key={skill} style={{
                    padding: '4px 12px', borderRadius: 99,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', fontSize: 12, fontWeight: 500,
                  }}>{skill}</span>
                ))}
                {result.missingSkills.length === 0 && (
                  <span style={{ color: '#334155', fontSize: 13 }}>No missing skills — great match!</span>
                )}
              </div>
            </div>

            {/* Tips */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 12 }}>
                💡 Quick Tips
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      minWidth: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)',
                      color: '#f59e0b', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}