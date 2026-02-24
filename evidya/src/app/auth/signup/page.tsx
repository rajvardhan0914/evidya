'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

const interests = ['AI/ML', 'Full Stack', 'Data Science', 'Product Management', 'Hardware Engineering']

export default function Signup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    areaOfInterest: interests[0],
    shortGoal: '',
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Signup failed')
      }

      const loginRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (loginRes?.ok) {
        router.push('/dashboard')
      } else {
        router.push('/auth/signin')
      }
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Right Column (Hero Section) - Moved for visual variety OR kept consistent */}
      {/* Sticking to Left Form / Right Hero for branding consistency */}

      {/* Left Column: Register Form */}
      <div className="flex flex-col p-8 md:p-12 lg:p-20 justify-center relative bg-white overflow-y-auto max-h-screen scrollbar-hide">
        <Link
          href="/"
          className="absolute top-6 left-8 flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>

        <div className="max-w-md w-full mx-auto pt-16 lg:pt-0">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-200">
              E
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">EVIDYA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Create your profile</h1>
            <p className="text-slate-500 font-medium leading-relaxed">Join the next generation of builders and thinkers.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Innovation Area</label>
                <select
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-bold"
                  value={form.areaOfInterest}
                  onChange={(e) => setForm({ ...form, areaOfInterest: e.target.value })}
                >
                  {interests.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
              <input
                required
                type="email"
                placeholder="you@university.edu"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium pr-14"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-5 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">College / Institution</label>
              <input
                required
                type="text"
                placeholder="Massachusetts Institute of Technology"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Your Primary Goal</label>
              <textarea
                required
                placeholder="Ex: I want to build AI systems that solve agricultural challenges in developing nations."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium resize-none"
                rows={3}
                value={form.shortGoal}
                onChange={(e) => setForm({ ...form, shortGoal: e.target.value })}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center space-x-3 text-red-600 animate-in fade-in slide-in-from-top-1">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b263b] hover:bg-[#0d1b2a] text-white py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-900/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Building profile...' : 'Join the Revolution'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 gap-4">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-500 mb-4">
                Looking to discover talent?
              </p>
              <Link
                href="/auth/company-signup"
                className="inline-flex items-center px-8 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 shadow-sm"
              >
                Register as Company <span className="ml-2">→</span>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-slate-500">
                Already a member? <Link href="/auth/signin" className="text-blue-600 hover:underline font-black">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Section */}
      <div className="hidden lg:flex flex-col justify-center items-start p-24 bg-[#0d1b2a] relative overflow-hidden text-white">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-black tracking-tighter mb-8 leading-[1.1] uppercase">
            Start your <span className="text-blue-500">evolution</span> today
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12">
            Build a profile that companies actually value. Proof of thinking, execution, and growth metrics that matter.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-black">✓</div>
              <p className="font-bold text-slate-300">Verified Coding Proofs</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-500 font-black">✓</div>
              <p className="font-bold text-slate-300">AI-Led Leadership Modules</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-500 font-black">✓</div>
              <p className="font-bold text-slate-300">Innovation Track Record</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}