'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function SubmitIdea() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    problem: '',
    approach: '',
    files: null as File | null
  })
  const [submitting, setSubmitting] = useState(false)
  const [aiGuidance, setAiGuidance] = useState<string | null>(null)
  const [gettingGuidance, setGettingGuidance] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const getGuidance = async () => {
    if (!formData.title || !formData.problem) {
      alert('Please provide a title and problem statement first.')
      return
    }
    setGettingGuidance(true)
    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('problem', formData.problem)
      payload.append('approach', formData.approach)
      if (formData.files) {
        payload.append('files', formData.files)
      }

      const res = await fetch('/api/ai/idea-guidance', {
        method: 'POST',
        body: payload
      })
      const result = await res.json()
      if (result.aiResponse) {
        setAiGuidance(result.aiResponse)
      } else if (result.guidance) {
        setAiGuidance(result.guidance[0])
      }
    } catch (error) {
      console.error('Guidance error:', error)
    } finally {
      setGettingGuidance(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const data = new FormData()
    data.append('title', formData.title)
    data.append('problem', formData.problem)
    data.append('approach', formData.approach)
    if (formData.files) data.append('files', formData.files)

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        body: data
      })
      if (res.ok) {
        const idea = await res.json()
        router.push(`/idea/${idea.id}`)
      } else {
        const err = await res.json()
        alert(`Error: ${err.error || 'Failed to submit idea'}`)
      }
    } catch (error) {
      alert('Network error submitting idea. Please check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return null
  if (!session) return null

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
        <div className="mb-10 text-left">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight uppercase">
            Create <span className="text-blue-600">New Proof</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-xl italic">
            "Document your thinking logic. The value is in the approach, not just the solution."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                    Idea Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Decentralized Water Filtration Logic"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                    The Problem Paradox
                  </label>
                  <textarea
                    placeholder="What specific friction or inefficiency have you identified?"
                    value={formData.problem}
                    onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-700 placeholder:text-slate-300 min-h-[150px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                    Technical Approach / Methodology
                  </label>
                  <textarea
                    placeholder="How does your logic resolve the paradox above? Explain the step-by-step thinking."
                    value={formData.approach}
                    onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-700 placeholder:text-slate-300 min-h-[250px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                    Attach Proof (Optional)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, files: e.target.files?.[0] || null })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept="image/*,.pdf,.ppt,.pptx"
                    />
                    <div className="w-full px-6 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:border-blue-400 transition-colors">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">{formData.files ? formData.files.name : 'Upload Diagrams / Evidence'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-slate-900 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black transition-all active:scale-[0.98] shadow-2xl disabled:opacity-20"
                  >
                    {submitting ? 'Archiving Proof...' : 'Submit to Ledger'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* AI Guidance Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-3xl border border-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 -mr-6 -mt-6 scale-150">
                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-[11px] shadow-lg shadow-blue-500/20">AI</div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Innovation Mentor</span>
                </div>

                <h3 className="text-xl font-bold mb-4 tracking-tight uppercase leading-tight">Shape Your Idea</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 italic">
                  "Before you submit, let me review your thinking. I don't give scores—I help you find blind spots."
                </p>

                {aiGuidance ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 animate-slide-up">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">Mentor Feedback</p>
                    <div className="text-slate-200 text-sm leading-relaxed font-medium whitespace-pre-line">
                      {aiGuidance}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl mb-8">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Awaiting Analysis...</p>
                  </div>
                )}

                <button
                  onClick={getGuidance}
                  disabled={gettingGuidance || !formData.problem}
                  className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center ${gettingGuidance ? 'bg-white/10 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-[0.98]'}`}
                >
                  {gettingGuidance ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Synthesizing Logic...
                    </span>
                  ) : 'Get Mentor Guidance'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4 block">Submission Protocol</span>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Once submitted, your idea will be indexed in our global innovation ledger and will be accessible via your professional profile.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
