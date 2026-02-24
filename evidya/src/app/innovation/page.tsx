'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from "next/link"

export default function InnovationLanding() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') return null
  if (!session) return null

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6">
        {/* Sleek Header */}
        <div className="mb-10 md:mb-12 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Thinking <span className="text-blue-600">Ledger</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl leading-relaxed">
            Record and verify your innovation proofs with industry-grade documentation routines.
          </p>
        </div>

        {/* Primary Action */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 md:p-14 text-center mb-8 mx-4 shadow-sm transition-all hover:shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 -mr-10 -mt-10 select-none">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
          </div>
          <div className="w-20 h-20 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-yellow-100 group-hover:scale-110 transition-transform">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Ledger Status: Empty</h2>
          <p className="text-slate-500 mb-12 max-w-sm mx-auto text-sm font-medium italic leading-relaxed">
            "Your documentation is the building block of your legacy. Initialize your first verified entry below."
          </p>
          <Link
            href="/innovation/submit"
            className="inline-flex items-center px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-black shadow-2xl active:scale-[0.98] transition-all relative z-10"
          >
            Create New Proof <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 px-4">
          <Link
            href="/innovation/submit"
            className="bg-white rounded-[1.5rem] border border-slate-200 p-8 md:p-10 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Submit Module</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 pt-8 border-t border-slate-50 font-medium">
              Enterprise interface for documenting high-logic problem solving.
            </p>
            <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[9px] group-hover:translate-x-2 transition-transform inline-block">Initialize Entry →</span>
          </Link>

          <Link
            href="/explore"
            className="bg-white rounded-[1.5rem] border border-slate-200 p-8 md:p-10 hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white shadow-inner">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Global Index</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 pt-8 border-t border-slate-50 font-medium">
              Access the distributed ledger of student thinking and innovation.
            </p>
            <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[9px] group-hover:translate-x-2 transition-transform inline-block">Network Scan →</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
