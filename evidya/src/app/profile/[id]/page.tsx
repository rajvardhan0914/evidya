'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

interface Profile {
  id: string
  name: string
  college: string
  areaOfInterest: string
  shortGoal: string
  ideas: { id: string; title: string; createdAt: string }[]
}

export default function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const resolvedParams = use(params)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (!resolvedParams?.id) return
    fetch(`/api/profiles/${resolvedParams.id}`)
      .then(res => res.json())
      .then(setProfile)
  }, [resolvedParams?.id])

  if (status === 'loading' || !profile) {
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
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-6">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{profile.name}</h1>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-medium">College:</span> {profile.college}</p>
                  <p><span className="font-medium">Interest:</span> {profile.areaOfInterest}</p>
                  <p><span className="font-medium">Goal:</span> {profile.shortGoal}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submitted Ideas</h2>
            {profile.ideas.length === 0 ? (
              <p className="text-gray-500">No ideas submitted yet.</p>
            ) : (
              <ul className="space-y-3">
                {profile.ideas.map(idea => (
                  <li key={idea.id} className="pb-3 border-b border-gray-200 last:border-0">
                    <Link href={`/idea/${idea.id}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      {idea.title}
                    </Link>
                    <span className="text-gray-500 ml-2 text-sm">
                      on {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}