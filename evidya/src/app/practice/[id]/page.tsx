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
}

export default function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (!resolvedParams?.id) return
    fetch(`/api/challenges/${resolvedParams.id}`)
      .then(res => res.json())
      .then(setChallenge)
  }, [resolvedParams?.id])

  const handleSubmit = async () => {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId: resolvedParams.id, code, language })
    })
    if (res.ok) {
      alert('Submission successful')
      // Log activity
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
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Problem Description</h2>
                <p className="text-gray-700 leading-relaxed">{challenge.description}</p>
              </div>
              {challenge.inputExample && (
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Input Example</h2>
                  <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm overflow-x-auto">{challenge.inputExample}</pre>
                </div>
              )}
              {challenge.outputExample && (
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">Output Example</h2>
                  <pre className="bg-gray-50 p-3 rounded border border-gray-200 text-sm overflow-x-auto">{challenge.outputExample}</pre>
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Submit Solution
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}