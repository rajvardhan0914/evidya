'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

interface Profile {
  id: string
  name: string
  image?: string
  college: string
  areaOfInterest: string
  ideasCount: number
}

interface Idea {
  id: string
  title: string
  problem: string
  user: {
    id: string
    name: string
    college: string
  }
  createdAt: string
}

export default function Explore() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ideas' | 'profiles'>('ideas')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetch('/api/profiles').then(res => res.json()).then(setProfiles)
    fetch('/api/ideas').then(res => res.json()).then(setIdeas)
  }, [])

  const filteredIdeas = ideas.filter(idea => searchQuery === '' || idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || idea.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredProfiles = profiles.filter(p => searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.college.toLowerCase().includes(searchQuery.toLowerCase()))

  if (status === 'loading') return null
  if (!session) return null

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-6">
        <div className="mb-10 md:mb-12 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Global <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium max-w-xl mb-12">
            Scanning verified proofs of thinking across the EVIDYA network.
          </p>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="Search thinkers or innovations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3.5 pl-12 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 font-medium text-sm outline-none transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm shrink-0 overflow-hidden">
              <button onClick={() => setActiveTab('ideas')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'ideas' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}>IDEAS</button>
              <button onClick={() => setActiveTab('profiles')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'profiles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}>BUILDERS</button>
            </div>
          </div>
        </div>

        {/* Grid Area - px-4 baseline */}
        <div className="px-4">
          {activeTab === 'ideas' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              {filteredIdeas.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No documentation units indexed.</p>
                </div>
              ) : (
                filteredIdeas.map(idea => (
                  <div key={idea.id} className="bg-white rounded-[1.5rem] border border-slate-200 p-6 md:p-8 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-600 uppercase text-xl shadow-inner border border-blue-100/50">
                        {idea.user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/profile/${idea.user.id}`} className="font-bold text-slate-900 hover:text-blue-600 text-sm tracking-tight block leading-tight mb-1">{idea.user.name}</Link>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">{idea.user.college}</span>
                      </div>
                    </div>
                    <Link href={`/idea/${idea.id}`} className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight tracking-tight group-hover:text-blue-600 transition-colors uppercase">{idea.title}</h2>
                      <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 italic">"{idea.problem}"</p>
                    </Link>
                    <div className="pt-8 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                      <Link href={`/idea/${idea.id}`} className="text-blue-600 font-black hover:underline underline-offset-4 decoration-2">Decrypt Record →</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProfiles.map(p => (
                <div key={p.id} className="bg-white rounded-[2rem] border border-slate-200 p-8 hover:shadow-xl transition-all text-center group relative overflow-hidden">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50/50 border border-emerald-100 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-emerald-600 font-black">{p.name.charAt(0)}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 tracking-tight text-xl mb-1">{p.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">{p.college}</p>
                  <Link href={`/profile/${p.id}`} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] block hover:opacity-90 transition-all active:scale-95 shadow-lg">Access Profile</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
