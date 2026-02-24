'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

interface Stats {
  ideasCount: number
  practiceCount: number
  daysActive: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ ideasCount: 0, practiceCount: 0, daysActive: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/stats')
        .then(res => res.json())
        .then(setStats)
    }
  }, [session])

  if (status === 'loading') return null
  if (!session) return null

  return (
    <AppLayout>
      <div className="w-full max-w-full overflow-x-hidden py-6">
        {/* Header Section */}
        <div className="mb-10 md:mb-16 text-left">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            Welcome back, <span className="text-blue-600">{session.user?.name?.split(' ')[0] || 'Builder'}</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-xl">
            Projecting your thinking journey across the EVIDYA network.
          </p>
        </div>

        {/* Stats Grid - No PX-4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          {[
            {
              label: 'Ideas Submitted',
              value: stats.ideasCount,
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
              color: 'text-yellow-600 bg-yellow-50'
            },
            {
              label: 'Challenges Won',
              value: stats.practiceCount,
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
              color: 'text-emerald-600 bg-emerald-50'
            },
            {
              label: 'Days Active',
              value: stats.daysActive,
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
              color: 'text-blue-600 bg-blue-50'
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-200 p-8 flex flex-col items-start transition-all hover:shadow-xl group">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform border border-slate-100/50`}>
                {stat.icon}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</span>
              <p className="text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Action Cards - No PX-4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/innovation/submit" className="bg-slate-900 text-white rounded-[2.5rem] p-10 md:p-12 group transition-all hover:bg-black hover:shadow-3xl active:scale-[0.98] border border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 translate-x-10 -translate-y-10 scale-[2] rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
            </div>
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6 block opacity-80 relative z-10">Workspace Module</span>
            <h3 className="text-2xl font-bold mb-4 tracking-tight relative z-10 leading-tight uppercase">Submit Documentation</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-xs relative z-10 italic font-medium">Record verified thinking proofs and build your leadership portfolio.</p>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 group-hover:text-blue-300 flex items-center relative z-10">
              Initialize Entry <span className="ml-3 group-hover:translate-x-3 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/practice" className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-12 group transition-all hover:shadow-3xl active:scale-[0.98] shadow-sm relative overflow-hidden">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6 block opacity-80">Skill Lab System</span>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight leading-tight uppercase">Practice Arena</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-xs italic font-medium">Sharpen engineering logic with AI-verified challenges daily.</p>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 group-hover:text-emerald-500 flex items-center">
              Initialize Sprint <span className="ml-3 group-hover:translate-x-3 transition-transform">→</span>
            </div>
          </Link>
        </div>

        {/* Activity Tracker */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 md:p-12 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Network Intelligence Sync</h2>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 shadow-inner">Operational</span>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-200"></div>
            </div>
          </div>
          <div className="text-center py-20 border-2 border-dashed border-slate-50 rounded-3xl bg-slate-50/20">
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px]">Synchronizing record ledger...</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
