'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'

export default function PostChallenge() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        reward: '',
        type: 'OPEN'
    })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (session?.user && (session.user as any).role !== 'COMPANY' && (session.user as any).role !== 'ADMIN') {
            router.push('/dashboard')
        }
    }, [status, session, router])

    if (status === 'loading') return null
    if (!session) return null

    const isVerified = (session.user as any).isVerified

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isVerified) {
            setError('Your account must be verified before posting challenges.')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                router.push('/challenges')
            } else {
                const data = await res.json()
                setError(data.error || 'Failed to post challenge')
            }
        } catch (err) {
            setError('Connection error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-12 px-4 md:px-6">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                        Deploy <span className="text-blue-600">Challenge</span>
                    </h1>
                    <p className="text-slate-500 font-medium italic text-sm md:text-base leading-relaxed max-w-2xl">
                        "Don't ask for skills. Ask for logic. The best talent solves the paradoxes you haven't yet addressed."
                    </p>
                </div>

                {!isVerified && (
                    <div className="mb-10 p-8 bg-amber-50 border border-amber-100 rounded-[2rem] flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100">
                            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-amber-900 mb-2 uppercase tracking-tight">Verification Required</h3>
                        <p className="text-amber-700 text-sm max-w-md font-medium leading-relaxed italic">
                            Your company profile is under manual review. Once verified, you will be able to deploy real-world challenges to the Global Arena.
                        </p>
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 md:p-12">
                    {error && (
                        <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Challenge Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Efficiency Optimization in Grid Storage"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Problem Paradox / Description</label>
                            <textarea
                                placeholder="Describe the logic friction... why is this hard to solve?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-medium text-slate-700 min-h-[250px]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Reward / Incentive (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., $500, Internship, Recognition"
                                    value={formData.reward}
                                    onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Visibility Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
                                >
                                    <option value="OPEN">GLOBAL ARENA (OPEN)</option>
                                    <option value="PRIVATE">PRIVATE REQUEST (INVITE)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting || !isVerified}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-[0.98] shadow-2xl ${!isVerified
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        : 'bg-slate-900 text-white hover:bg-black'
                                    }`}
                            >
                                {submitting ? 'Initializing Deployment...' : 'Deploy Challenge to Arena'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    )
}
