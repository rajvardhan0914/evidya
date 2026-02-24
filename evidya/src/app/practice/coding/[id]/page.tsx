'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
  inputExample: string | null
  outputExample: string | null
  starterCode: string | null
}

export default function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  const [explanation, setExplanation] = useState('')
  const [hint, setHint] = useState('')
  const [hintLoading, setHintLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (!resolvedParams?.id) return
    fetch(`/api/challenges/${resolvedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch challenge')
        return res.json()
      })
      .then(data => {
        setChallenge(data)
        // Set starter code if code is empty
        if (data.starterCode && !code) {
          setCode(data.starterCode)
        }
      })
      .catch(err => {
        console.error(err)
        router.push('/practice')
      })
  }, [resolvedParams?.id, router])

  const handleGetHint = async () => {
    if (hintLoading) return
    setHintLoading(true)
    try {
      const res = await fetch(`/api/challenges/${resolvedParams.id}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      setHint(data.hint || 'No hint available')
    } catch (err) {
      setHint('Failed to get hint. Check if Ollama is running.')
    } finally {
      setHintLoading(false)
    }
  }

  const handleSubmit = async () => {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: resolvedParams.id,
        code,
        language,
        explanation // New: Pass explanation to trigger AI feedback
      })
    })
    if (res.ok) {
      alert('Submission successful! AI feedback is being generated.')
      // Optionally scroll user to top or dashboard
    } else {
      alert('Error submitting')
    }
  }

  if (status === 'loading' || !challenge) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    )
  }
  if (!session) return null

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
                <span className="text-gray-400 text-sm">•</span>
                <p className="text-gray-500 text-sm">Coding Challenge</p>
              </div>
            </div>
            <button
              onClick={handleGetHint}
              disabled={hintLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{hintLoading ? 'Thinking...' : 'Need a Hint?'}</span>
            </button>
          </div>

          {hint && (
            <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 animate-slide-down">
              <div className="text-amber-500 shrink-0">💡</div>
              <p className="text-amber-800 text-sm italic">{hint}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] min-h-[600px]">
            {/* Left Panel: Problem & Explanation */}
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Problem Description</h2>
                <div className="prose prose-sm text-gray-700 max-w-none leading-relaxed">
                  {challenge.description}
                </div>

                <div className="mt-8 space-y-6">
                  {challenge.inputExample && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Example Input</h3>
                      <pre className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm font-mono text-gray-600">{challenge.inputExample}</pre>
                    </div>
                  )}
                  {challenge.outputExample && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Example Output</h3>
                      <pre className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm font-mono text-gray-600">{challenge.outputExample}</pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Explain Your Approach</h2>
                <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-medium">For AI Analysis</p>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="E.g., 'I used a hash map to track seen values...'"
                  className="w-full h-32 p-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="flex flex-col space-y-4">
              {/* Editor Toolbar */}
              <div className="flex items-center justify-between bg-[#1e1e1e] p-2 rounded-t-lg border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5 px-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-1 outline-none border border-gray-600 hover:border-gray-500 cursor-pointer"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <span className="text-xs text-gray-500 pr-2 font-mono">main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'java'}</span>
              </div>

              {/* Code Area */}
              <div className="flex-1 relative group">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full h-full p-4 bg-[#1e1e1e] text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none rounded-b-lg shadow-inner focus:shadow-md transition-shadow border-none custom-scrollbar"
                  style={{ fontFamily: '"Fira Code", monospace' }}
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { navigator.clipboard.writeText(code); alert("Copied!") }}
                    className="p-2 bg-white/10 rounded-md hover:bg-white/20 text-white text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.99] uppercase tracking-widest text-xs flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Execute & Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
