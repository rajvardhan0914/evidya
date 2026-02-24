'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

interface ActivityLog {
  id: string
  action: string
  details: string | null
  createdAt: string
}

export default function Profile() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [userData, setUserData] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editForm, setEditForm] = useState({
    name: '',
    shortGoal: '',
    college: '',
    areaOfInterest: '',
    bio: '',
    location: '',
    skills: '',
    image: '',
    coverImage: ''
  })

  // Refs for file inputs
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me')
      const data = await res.json()
      setUserData(data)
      setEditForm({
        name: data.name || '',
        shortGoal: data.shortGoal || '',
        college: data.college || '',
        areaOfInterest: data.areaOfInterest || '',
        bio: data.bio || '',
        location: data.location || '',
        skills: data.skills || '',
        image: data.image || '',
        coverImage: data.coverImage || ''
      })
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchUserData()

      fetch('/api/user/activity')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setActivityLogs(data)
        })
        .catch(() => setActivityLogs([]))
    }
  }, [session])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'coverImage') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, [type]: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (res.ok) {
        await fetchUserData()
        await updateSession()
        setIsEditing(false)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Network error')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading') return null
  if (!session) return null

  const user = userData || session.user

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Profile Identity Card */}
        <div className="bg-white rounded-b-[2.5rem] md:rounded-[2.5rem] border border-slate-200 overflow-hidden mb-8 shadow-2xl transition-all duration-500">
          {/* Cover Header */}
          <div className="h-48 md:h-72 relative group bg-slate-100 italic">
            {editForm.coverImage || user.coverImage ? (
              <img
                src={editForm.coverImage || user.coverImage}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Profile Cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white/10 text-[10vw] font-black tracking-tighter select-none">EVIDYA</div>
              </div>
            )}

            {isEditing && (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold uppercase tracking-widest text-xs transition-opacity"
              >
                Change Cover Background
              </button>
            )}
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} />
          </div>

          <div className="px-6 md:px-12 pb-12 -mt-16 md:-mt-24 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
              <div className="flex flex-col md:flex-row md:items-end gap-8">
                {/* Profile Photo Wrapper */}
                <div className="relative group/avatar">
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-white p-2 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {editForm.image || user.image ? (
                      <img
                        src={editForm.image || user.image}
                        className="w-full h-full object-cover rounded-[2rem] shadow-inner"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] flex items-center justify-center text-5xl text-white font-black shadow-inner">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white font-bold uppercase tracking-widest text-[10px] m-2 transition-opacity"
                    >
                      Change Photo
                    </button>
                  )}
                  <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} />
                </div>

                <div className="pb-4">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none mb-6">
                    {user.name || 'User'}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-slate-900 text-white font-bold uppercase text-[10px] tracking-widest px-5 py-2 rounded-2xl shadow-lg">
                      {user.college || 'Universal Learner'}
                    </span>
                    <span className="bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest px-5 py-2 rounded-2xl shadow-lg">
                      {user.areaOfInterest || 'Scholar'}
                    </span>
                    {user.location && (
                      <span className="bg-white text-slate-500 font-bold uppercase text-[10px] tracking-widest px-5 py-2 rounded-2xl border border-slate-200">
                        {user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-10 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-[0.98] ${isEditing ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                >
                  {isEditing ? 'Cancel Modification' : 'Modify Proof Identity'}
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Identity Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 placeholder:text-slate-300 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Primary Institution</label>
                    <input
                      type="text"
                      value={editForm.college}
                      onChange={e => setEditForm({ ...editForm, college: e.target.value })}
                      className="w-full px-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Current Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Main Expertise</label>
                    <input
                      type="text"
                      value={editForm.areaOfInterest}
                      onChange={e => setEditForm({ ...editForm, areaOfInterest: e.target.value })}
                      className="w-full px-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Identity Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={4}
                    className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-500/10 font-medium text-slate-600 leading-relaxed transition-all resize-none"
                    placeholder="Tell us about your learning journey..."
                  />
                </div>

                <div className="space-y-3 mb-10">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Skills & Tools (Comma separated)</label>
                  <input
                    type="text"
                    value={editForm.skills}
                    onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                    className="w-full px-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-900 transition-all"
                    placeholder="React, Design, Python, Logic..."
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSaving ? 'Synchronizing Records...' : 'Deploy Identity Updates'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 animate-in fade-in duration-700">
                <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Manifesto</h3>
                    <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-blue-500/20 pl-8 py-2">
                      "{user.bio || 'This thinking ledger is currently awaiting initialization. Capture your thoughts to begin building proof of your cognitive effort.'}"
                    </p>
                  </section>

                  {user.skills && (
                    <section>
                      <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Cognitive Stack</h3>
                      <div className="flex flex-wrap gap-3">
                        {user.skills.split(',').map((skill: string, i: number) => (
                          <span key={i} className="px-6 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-slate-100 hover:border-blue-400 hover:text-blue-600 transition-all cursor-default shadow-sm">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Engagement Metrics</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Intelligence Pt', value: '4,200', color: 'text-blue-600' },
                        { label: 'Focus Hours', value: '128', color: 'text-indigo-600' },
                        { label: 'Consistency', value: '94%', color: 'text-emerald-600' }
                      ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
                          <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="px-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm">
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Temporal Innovation Sequence</h3>
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Node Active</span>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              </div>
            </div>

            {activityLogs.length > 0 ? (
              <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {activityLogs.map((log, i) => (
                  <div key={i} className="flex gap-10 relative z-10 group pl-0.5">
                    <div className="w-5 h-5 rounded-full bg-white border-4 border-slate-200 shadow-sm group-hover:border-blue-600 group-hover:scale-125 transition-all shrink-0 mt-1.5 duration-300"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">{log.action}</h4>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium italic leading-relaxed">"{log.details || 'System metadata logged for thinking validation.'}"</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] italic">Awaiting cognitive activity to populate the sequence...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
