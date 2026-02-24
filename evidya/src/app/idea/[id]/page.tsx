'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

interface Idea {
  id: string
  title: string
  problem: string
  approach: string
  files: string | null
  user: { name: string; college: string }
  createdAt: string
}

export default function IdeaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [idea, setIdea] = useState<Idea | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (!resolvedParams?.id) return
    fetch(`/api/ideas/${resolvedParams.id}`)
      .then(async res => {
        if (!res.ok) {
          console.error(`API Error: Status ${res.status}`)
          const errorData = await res.json().catch(() => ({}))
          console.error('API Error body:', errorData)
          throw new Error(errorData.error || 'Failed to fetch idea')
        }
        return res.json()
      })
      .then(setIdea)
      .catch(err => {
        console.error('Fetch error:', err.message)
      })
  }, [resolvedParams?.id])

  if (status === 'loading' || !idea) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    )
  }
  if (!session) return null

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {idea.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h1>
                <p className="text-gray-600 mb-1">
                  Submitted by <span className="font-semibold">{idea.user.name}</span> from {idea.user.college}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(idea.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Problem</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.problem}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Approach</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.approach}</p>
            </div>

            {idea.files && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Attachments</h2>
                <img
                  src={`data:image/png;base64,${idea.files}`}
                  alt="Idea file"
                  className="max-w-full rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}