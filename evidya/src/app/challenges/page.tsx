'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

interface Hackathon {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: 'upcoming' | 'active' | 'ended'
  participants: number
  companyName?: string
  reward?: string | null
}

export default function Challenges() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch('/api/challenges')
        const data = await res.json()
        if (Array.isArray(data)) {
          setHackathons(data.map((c: { id: string; title: string; description: string; createdAt: string; status: string; companyName?: string; reward?: string | null }) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            startDate: c.createdAt,
            endDate: c.createdAt,
            status: c.status === 'ACTIVE' ? 'active' : 'ended',
            participants: 0,
            companyName: c.companyName,
            reward: c.reward
          })))
        }
      } catch (error) {
        console.error('Failed to fetch challenges:', error)
      }
    }

    fetchChallenges()
  }, [])

  if (status === 'loading') return null
  if (!session) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-50'
      case 'active': return 'text-emerald-600 bg-emerald-50'
      case 'ended': return 'text-slate-400 bg-slate-50'
      default: return 'text-gray-400 bg-gray-50'
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="mb-10 md:mb-12 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">The <span className="text-blue-600">Arena</span></h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">
            Industry-grade hackathons. Build verified documentation and compete globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4">
          {hackathons.map((hackathon) => (
            <div
              key={hackathon.id}
              className="bg-white rounded-[1.5rem] border border-slate-200 p-6 md:p-8 flex flex-col transition-all hover:shadow-xl relative overflow-hidden group"
            >
              <div className="mb-10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{hackathon.companyName || 'GLOBAL'}</span>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase">{hackathon.title}</h2>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(hackathon.status)} shadow-sm`}>
                  {hackathon.status}
                </span>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase">{hackathon.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 italic">"{hackathon.description}"</p>

                <div className="space-y-4 mb-10 pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <svg className="w-4 h-4 mr-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{new Date(hackathon.startDate).toLocaleDateString()}</span>
                    </div>
                    {hackathon.reward && (
                      <div className="flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {hackathon.reward}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button className={`w-full py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98] ${hackathon.status === 'upcoming'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : hackathon.status === 'active'
                  ? 'bg-slate-900 text-white hover:bg-black'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}>
                {hackathon.status === 'upcoming' ? 'Join Waiting List' : hackathon.status === 'active' ? 'Initialize Entry' : 'Results Published'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
