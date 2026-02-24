'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

interface Course {
    id: string
    title: string
    description: string
    level: string
    stream?: string
    category: string
    status: 'Free' | 'Premium' | 'Coming Soon'
    order: number
    _count?: {
        topics: number
    }
}

export default function Courses() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [filter, setFilter] = useState('All')
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, router])

    useEffect(() => {
        fetchCourses()
    }, [filter])

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filter !== 'All') {
                if (filter === '10th' || filter === 'Intermediate' || filter === 'B.Tech') {
                    params.append('level', filter)
                } else {
                    params.append('category', filter)
                }
            }
            const res = await fetch(`/api/courses?${params}`)
            const data = await res.json()
            // Ensure data is an array before setting state
            setCourses(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch courses:', error)
            setCourses([])
        } finally {
            setLoading(false)
        }
    }

    if (status === 'loading' || loading) return null
    if (!session) return null

    const categories = ['All', '10th', 'Intermediate', 'B.Tech', 'Mathematics', 'Science']

    return (
        <AppLayout>
            <div className="w-full max-w-full overflow-x-hidden py-4">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
                        Syllabus <span className="text-blue-600">Arena</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium max-w-lg leading-relaxed">
                        Industry-grade build routines for academic chapters.
                    </p>
                </div>

                {/* Filter Tabs - Constrained width */}
                <div className="flex mb-10 overflow-x-auto pb-4 scrollbar-hide max-w-full">
                    <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex space-x-1 shrink-0 shadow-sm">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-5 md:px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === cat
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col transition-all hover:shadow-xl group"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-0.5">{course.category}</span>
                                    <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest leading-none">{course.level}</span>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${course.status === 'Free' ? 'text-emerald-700 bg-emerald-50' :
                                    course.status === 'Premium' ? 'text-amber-700 bg-amber-50' :
                                        'text-slate-400 bg-slate-50'
                                    }`}>
                                    {course.status}
                                </span>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight tracking-tight uppercase group-hover:text-blue-600 transition-colors">{course.title}</h2>
                                <p className="text-slate-500 text-sm leading-relaxed mb-10 line-clamp-3 italic">
                                    "{course.description}"
                                </p>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                                <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    {course._count?.topics || 0} Topics
                                </div>
                                <Link
                                    href={`/courses/${course.id}`}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 shadow-lg"
                                >
                                    Access
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Module */}
                <div className="mt-12 p-8 md:p-14 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden border border-white/5">
                    <div className="relative z-10 max-w-2xl text-left">
                        <span className="text-[8px] font-bold text-blue-400 uppercase tracking-[0.4em] mb-4 block">Archive v1.0</span>
                        <h3 className="text-xl md:text-3xl font-bold mb-6 tracking-tight leading-tight">Educational foundations re-indexed for high-performance builds.</h3>
                        <p className="text-slate-400 text-xs leading-relaxed mb-8 italic">
                            Transforming academic complexity into verifiable documentation blocks.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400">98% Match</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
