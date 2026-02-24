'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

interface Lesson {
    id: string
    title: string
    duration: string
    isCompleted: boolean
    isLocked: boolean
    engagingSummary: string
    syllabusMatch: string
    videoUrl: string
    detailedNotes: string[]
}

interface CourseData {
    title: string
    objective: string
    longDescription: string
    subjects?: { id: string; name: string }[]
    lessons: Record<string, Lesson[]> | Lesson[]
}

const COURSE_CONTENT: Record<string, CourseData> = {
    'grade-10-logic': {
        title: 'Grade 10: Full Academic Vault',
        objective: 'Objective: Total Subject Mastery',
        longDescription: 'This is a fully teaching track for the 10th Standard. We cover every major subject required to pass your exams with logic-first documentation.',
        subjects: [
            { id: 'math', name: 'Mathematics' },
            { id: 'science', name: 'Science' },
            { id: 'social', name: 'Social Studies' },
            { id: 'english', name: 'English' }
        ],
        lessons: {
            'math': [
                {
                    id: 'm1', title: 'Directive: Quadratic Equation Logic', duration: '20m', isCompleted: true, isLocked: false,
                    engagingSummary: 'Learn to solve ax² + bx + c = 0 by understanding the parabolic logic of reality.',
                    syllabusMatch: 'Math Chapter 4: Quadratic Equations',
                    videoUrl: 'https://www.youtube.com/embed/Z6X2ooLq8e4',
                    detailedNotes: [
                        'Standard Form: ax² + bx + c = 0, where a ≠ 0.',
                        'The Discriminant (D = b² - 4ac) tells us the nature of the roots.',
                        'D > 0: Two distinct real roots.',
                        'D = 0: Two equal real roots.',
                        'D < 0: No real roots.',
                        'Quadratic Formula: x = [-b ± √D] / 2a'
                    ]
                },
                {
                    id: 'm2', title: 'Directive: Trigonometric Ratios', duration: '25m', isCompleted: false, isLocked: false,
                    engagingSummary: 'Master the math behind heights and distances using triangles.',
                    syllabusMatch: 'Math Chapter 8: Trigonometry',
                    videoUrl: 'https://www.youtube.com/embed/K84v8d6xXl0',
                    detailedNotes: [
                        'Trigonometry is the study of relationships between sides and angles of triangles.',
                        'sin θ = Opposite / Hypotenuse',
                        'cos θ = Adjacent / Hypotenuse',
                        'tan θ = Opposite / Adjacent',
                        'Fundamental Identity: sin²θ + cos²θ = 1'
                    ]
                }
            ],
            'science': [
                {
                    id: 's1', title: 'Directive: Light & Vision Logic', duration: '22m', isCompleted: false, isLocked: false,
                    engagingSummary: 'Understanding how photons bounce off surfaces to create the world you see.',
                    syllabusMatch: 'Science Chapter 10: Light - Reflection and Refraction',
                    videoUrl: 'https://www.youtube.com/embed/5D-i-7XbF_U',
                    detailedNotes: [
                        'Reflection: Bouncing back of light in the same medium.',
                        'Laws of Reflection: Angle i = Angle r.',
                        'Mirror Formula: 1/v + 1/u = 1/f',
                        'Refractive Index (n) = Speed of light in vacuum / Speed in medium.'
                    ]
                },
                {
                    id: 's2', title: 'Directive: Life Process Protocols', duration: '30m', isCompleted: false, isLocked: false,
                    engagingSummary: 'The biological OS. Nutrition, Respiration, and Transportation in living machines.',
                    syllabusMatch: 'Science Chapter 6: Life Processes',
                    videoUrl: 'https://www.youtube.com/embed/8vO_YPFY86A',
                    detailedNotes: [
                        'Autotrophic Nutrition: Plants using photosynthesis to convert sunlight into energy.',
                        'Aerobic Respiration: Breakdown of glucose using oxygen in mitochondria.',
                        'Transpiration: Loss of water from plant leaves—the motor for water pull.',
                        'Human Circulatory System: The 4-chambered heart logic.'
                    ]
                }
            ],
            'social': [
                {
                    id: 'so1', title: 'Directive: Nationalism Protocols', duration: '20m', isCompleted: false, isLocked: false,
                    engagingSummary: 'How ideas changed the map of Europe. The logic of identity and borders.',
                    syllabusMatch: 'Social: The Rise of Nationalism in Europe',
                    videoUrl: 'https://www.youtube.com/embed/uG_A8-N-v-w',
                    detailedNotes: [
                        'The French Revolution (1789) introduced the "collective identity" logic.',
                        'Napoleonic Code (1804): Simplified administrative divisions and abolished the feudal system.',
                        'Nation-states emerged based on common language, culture, and history.'
                    ]
                }
            ],
            'english': [
                {
                    id: 'e1', title: 'Directive: The Logic of Faith', duration: '15m', isCompleted: false, isLocked: false,
                    engagingSummary: 'Analysis of "A Letter to God". The paradox of belief vs irony.',
                    syllabusMatch: 'English: A Letter to God',
                    videoUrl: 'https://www.youtube.com/embed/v2l78y7-XlE',
                    detailedNotes: [
                        'Lencho’s character: Extreme faith in God, but distrust of institutional humans.',
                        'Irony: The postmaster, who helped Lencho, was called a "bunch of crooks".',
                        'Theme: Faith can move mountains but can also lead to blind assumptions.'
                    ]
                }
            ]
        }
    },
    'grade-12-calculus-innovation': {
        title: 'Grade 12: Applied Calculus',
        objective: 'Objective: Predicting Modern Change',
        longDescription: 'Calculus is the math of movement. To pass, you need to stop seeing formulas and start seeing "rates of change" in markets, physics, and AI.',
        lessons: [
            { id: 'c1', title: 'Directive: Infinite Approximation', duration: '20m', isCompleted: true, isLocked: false, engagingSummary: 'What happens when we get infinitely close to a limit? Solving the paradox of 0/0.', syllabusMatch: 'Math Chapter 5: Continuity and Differentiability', videoUrl: 'https://www.youtube.com/embed/5D-i-7XbF_U', detailedNotes: ['Limits define continuity.'] },
        ]
    }
}

export default function CourseViewer() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()

    // Core State
    const [activeSubjectId, setActiveSubjectId] = useState('')
    const [activeLessonIdx, setActiveLessonIdx] = useState(0)

    // Resolve course data
    const courseId = params?.id as string || 'grade-10-logic'
    const course = COURSE_CONTENT[courseId] || COURSE_CONTENT['grade-10-logic']

    // Set initial subject for multi-subject courses
    useEffect(() => {
        if (course.subjects && !activeSubjectId) {
            setActiveSubjectId(course.subjects[0].id)
        }
    }, [course, activeSubjectId])

    // Derived lessons list with strict array guarantee
    const lessons = useMemo(() => {
        if (!course) return []

        if (course.subjects) {
            // Multi-subject mode (e.g. Grade 10)
            const subjectId = activeSubjectId || (course.subjects.length > 0 ? course.subjects[0].id : '')
            if (!subjectId) return []
            const subjectLessons = (course.lessons as Record<string, Lesson[]>)[subjectId]
            return Array.isArray(subjectLessons) ? subjectLessons : []
        }

        // Single track mode
        return Array.isArray(course.lessons) ? course.lessons : []
    }, [course, activeSubjectId])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        }
    }, [status, router])

    if (status === 'loading') return null
    if (!session) return null

    const currentLesson = lessons[activeLessonIdx] || lessons[0]

    return (
        <AppLayout>
            <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 m-2 md:m-4">

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide bg-white">
                    <div className="p-6 md:p-10">
                        {/* Navigation Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <Link href="/courses" className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center uppercase tracking-[0.2em] transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                Back to Arena
                            </Link>

                            {/* Subject Selector for 10th Standard */}
                            {course.subjects && (
                                <div className="flex bg-slate-100 p-1 rounded-xl space-x-1 shadow-inner border border-slate-200/50">
                                    {course.subjects.map(subject => (
                                        <button
                                            key={subject.id}
                                            onClick={() => { setActiveSubjectId(subject.id); setActiveLessonIdx(0); }}
                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeSubjectId === subject.id
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                        >
                                            {subject.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Functional Video Player */}
                        <div className="aspect-video bg-black rounded-[2rem] mb-12 relative overflow-hidden shadow-3xl border border-slate-200">
                            {currentLesson?.videoUrl ? (
                                <iframe
                                    className="w-full h-full"
                                    src={currentLesson.videoUrl}
                                    title={currentLesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 font-black uppercase tracking-widest">
                                    Initializing Visual Stream...
                                </div>
                            )}
                        </div>

                        {/* Study Matter & Detailed Notes */}
                        {currentLesson && (
                            <div className="max-w-4xl">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight leading-none">
                                    {currentLesson.title}
                                </h1>

                                <div className="flex items-center space-x-3 mb-10">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-lg border border-blue-100 tracking-widest">Core Content</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentLesson.syllabusMatch}</span>
                                </div>

                                {/* Study Matter Block (Actual Education Data) */}
                                <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-12 mb-12 shadow-sm">
                                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8 flex items-center">
                                        <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        Study Documentation
                                    </h2>
                                    <div className="space-y-6">
                                        {currentLesson.detailedNotes.map((note, i) => (
                                            <div key={i} className="flex items-start group">
                                                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-blue-600 mr-4 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                    {i + 1}
                                                </div>
                                                <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed pt-0.5">
                                                    {note}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Context Engagement */}
                                <div className="p-8 bg-blue-600 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group mb-12">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 -mr-6 -mt-6 scale-150 transition-transform group-hover:rotate-0">
                                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                                    </div>
                                    <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-4 block">Exam Strategy</span>
                                    <h4 className="text-xl font-bold mb-4 tracking-tight leading-none uppercase">Success Directive</h4>
                                    <p className="text-white/80 text-sm font-medium leading-relaxed max-w-lg italic">
                                        "To pass this unit, you must be able to explain the {currentLesson.title.split(': ')[1]} and apply it to at least one real-world problem simulation."
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Subject Curriculum & AI Mentor */}
                <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
                    <div className="p-8 border-b border-slate-200 bg-white flex shrink-0 items-center justify-between">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Curriculum Flow</h3>
                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[8px] font-black uppercase">
                            {lessons.length} Modules
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                        {Array.isArray(lessons) && lessons.map((lesson, idx) => (
                            <button
                                key={lesson.id}
                                onClick={() => !lesson.isLocked && setActiveLessonIdx(idx)}
                                className={`w-full p-5 rounded-[1.5rem] flex items-center justify-between transition-all group ${activeLessonIdx === idx
                                    ? 'bg-white shadow-2xl shadow-blue-600/10 border border-blue-600/10 ring-4 ring-blue-600/[0.03]'
                                    : 'hover:bg-white text-slate-400 border border-transparent'
                                    } ${lesson.isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center text-left min-w-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 text-[11px] font-black shrink-0 transition-colors ${activeLessonIdx === idx ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200/50 text-slate-500'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase tracking-tight truncate ${activeLessonIdx === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {lesson.title.split(': ')[1]}
                                        </p>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">{lesson.duration}</span>
                                    </div>
                                </div>
                                {lesson.isLocked ? (
                                    <svg className="w-4 h-4 text-slate-300 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                ) : lesson.isCompleted ? (
                                    <div className="w-6 h-6 rounded-[0.75rem] bg-emerald-500 flex items-center justify-center text-white shrink-0 ml-2 shadow-lg shadow-emerald-500/20"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></div>
                                ) : null}
                            </button>
                        ))}
                    </div>

                    {/* Highly-Aware AI Mentor Anchor */}
                    <div className="p-8 border-t border-slate-200 bg-white rounded-t-[3rem] shadow-3xl ring-1 ring-slate-200/50 relative z-20">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-[11px] font-black shadow-lg shadow-blue-500/20">AI</div>
                            <div>
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] block">Syllabus Guru</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.2em]">Live Sync</span>
                            </div>
                        </div>
                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-6 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                            "Ask me a specific question about {currentLesson?.title.split(': ')[1] || 'this unit'} to verify your logic!"
                        </p>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-[0.98]">Initalize Expert Chat</button>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
