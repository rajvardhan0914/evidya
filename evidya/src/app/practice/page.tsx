'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Link from 'next/link'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: string
}

export default function Practice() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'coding' | 'aptitude' | 'gaming' | 'communication'>('coding')
  const [challenges, setChallenges] = useState<Challenge[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (activeTab === 'coding') {
      fetch('/api/practice/coding')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setChallenges(data)
          } else {
            console.error('Coding challenges API returned non-array:', data)
            setChallenges([])
          }
        })
        .catch(err => {
          console.error('Fetch error:', err)
          setChallenges([])
        })
    }
  }, [activeTab])

  if (status === 'loading') return null
  if (!session) return null

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-emerald-600 bg-emerald-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-slate-600 bg-slate-50'
    }
  }

  return (
    <AppLayout>
      <div className="w-full max-w-full overflow-x-hidden py-4">
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight text-left">
            Level Up <span className="text-blue-600">Your Skills</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 font-medium text-left leading-relaxed">
            Verified thinking applied to engineering execution.
          </p>
        </div>

        {/* Tab Bar - Fluid Scrolling */}
        <div className="flex mb-8 overflow-x-auto pb-4 scrollbar-hide max-w-full">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 flex space-x-1 shrink-0 shadow-sm">
            {[
              { id: 'coding', label: 'Coding' },
              { id: 'aptitude', label: 'Aptitude' },
              { id: 'gaming', label: 'Gaming' },
              { id: 'communication', label: 'Comm' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 md:px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full">
          {activeTab === 'coding' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-slide-up">
              {challenges.map(challenge => (
                <Link
                  key={challenge.id}
                  href={`/practice/coding/${challenge.id}`}
                  className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col transition-all hover:shadow-xl h-full group"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100/50">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </div>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 leading-tight tracking-tight uppercase group-hover:text-blue-600 transition-colors">{challenge.title}</h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-3 italic">"{challenge.description}"</p>
                  <div className="flex items-center text-blue-600 font-bold text-[9px] pt-8 border-t border-slate-50 uppercase tracking-[0.2em]">
                    <span>Initialize Session <span className="ml-1 group-hover:translate-x-2 transition-transform inline-block">→</span></span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'aptitude' && <AptitudeModule />}
          {activeTab === 'gaming' && (
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-center animate-slide-up text-white relative border border-white/5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 -mr-10 -mt-10 select-none">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.16.09-.36.14-.57.14s-.41-.05-.57-.14l-7.9-4.44c-.31-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.9-4.44c.16-.09.36-.14.57-.14s.41.05.57.14l7.9 4.44c.31.17.53.5.53.88v9z" /></svg>
              </div>
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 relative z-10 shadow-lg border border-blue-400/30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight relative z-10">Strategy Labs</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-12 leading-relaxed relative z-10 font-medium italic">AI-driven logic simulations for next-gen engineering leadership.</p>
              <button className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 active:scale-95 transition-all relative z-10 shadow-3xl">Waiting sequence...</button>
            </div>
          )}
          {activeTab === 'communication' && <CommunicationModule />}
        </div>
      </div>
    </AppLayout>
  )
}

function AptitudeModule() {
  const [question, setQuestion] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('')
  const [showResult, setShowResult] = useState(false)

  const fetchQuestion = async () => {
    setLoading(true); setQuestion(null); setShowResult(false); setSelected('')
    try {
      const res = await fetch('/api/aptitude/generate')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setQuestion(data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchQuestion() }, [])

  if (loading) return <div className="py-24 text-center animate-pulse text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Initializing logical sequence...</div>
  if (!question) return <div className="py-24 text-center"><button onClick={fetchQuestion} className="text-blue-600 font-bold uppercase tracking-[0.2em] text-[10px] border-b-2 border-blue-600/10 pb-1">Reset Sequence?</button></div>

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 animate-slide-up shadow-sm">
      <div className="flex items-center justify-between mb-12">
        <span className="px-4 py-1.5 bg-purple-50 text-purple-600 text-[9px] font-black uppercase rounded-xl tracking-[0.2em] border border-purple-100">{question.type}</span>
        <button onClick={fetchQuestion} className="text-slate-400 hover:text-blue-600 transition text-[10px] font-bold uppercase tracking-widest group">Skip <span className="group-hover:translate-x-1 transition-transform inline-block">→</span></button>
      </div>
      <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-14 leading-tight tracking-tight text-left">"{question.question}"</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
        {question.options.map((opt: string, i: number) => (
          <button
            key={i}
            disabled={showResult}
            onClick={() => setSelected(opt)}
            className={`p-6 md:p-8 rounded-3xl border-2 text-left transition-all text-base font-bold tracking-tight ${selected === opt
              ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-lg shadow-blue-500/10'
              : 'border-slate-50 hover:border-slate-200 text-slate-500 hover:bg-slate-50/50'
              } ${showResult && opt === question.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' : ''}
               ${showResult && selected === opt && opt !== question.correctAnswer ? 'border-red-500 bg-red-50 text-red-700 font-black' : ''}`}
          >
            <div className="flex items-center">
              <span className="w-10 h-10 rounded-2xl bg-white border border-inherit flex items-center justify-center mr-5 shrink-0 font-black text-[11px] shadow-sm uppercase group-hover:scale-110 transition-transform">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
            </div>
          </button>
        ))}
      </div>
      {!showResult ? (
        <button
          disabled={!selected}
          onClick={() => setShowResult(true)}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-bold shadow-3xl disabled:opacity-20 transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-[11px]"
        >
          Verify Logic Integrity
        </button>
      ) : (
        <div className="p-8 bg-slate-50 rounded-3xl animate-in fade-in zoom-in-95 border border-slate-100 shadow-inner">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected === question.correctAnswer ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'} text-white shadow-lg text-lg`}>
              {selected === question.correctAnswer ? '✓' : '×'}
            </div>
            <h4 className={`text-2xl font-black uppercase tracking-tight ${selected === question.correctAnswer ? 'text-emerald-600' : 'text-red-600'}`}>
              {selected === question.correctAnswer ? 'Sequence Validated' : 'Logic Exception'}
            </h4>
          </div>
          <p className="text-slate-500 text-base leading-relaxed mb-10 font-medium italic">"{question.explanation}"</p>
          <button onClick={fetchQuestion} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-[0.3em] text-[11px]">Generate Next Paradox</button>
        </div>
      )}
    </div>
  )
}

function CommunicationModule() {
  const [mode, setMode] = useState<'read' | 'listen' | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState<any>(null)
  const [stage, setStage] = useState<'selection' | 'exercise' | 'analysis'>('selection')

  const fetchPrompt = async (selectedMode: 'read' | 'listen') => {
    setLoading(true)
    try {
      const res = await fetch('/api/communication/prompt')
      const data = await res.json(); setPrompt(data); setMode(selectedMode); setStage('exercise'); setTranscript(''); setAnalysis(null)
      if (selectedMode === 'listen') { speak(data.scenario) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const speak = (text: string) => { const u = new SpeechSynthesisUtterance(text); window.speechSynthesis.speak(u) }

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return alert('Speech recognition not supported.')
    const rec = new SR(); rec.continuous = true; rec.interimResults = true;
    rec.onstart = () => setIsRecording(true); rec.onend = () => setIsRecording(false)
    rec.onresult = (e: any) => { let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript; setTranscript(t) };
    (window as any)._rec = rec; rec.start()
  }

  const stopRecording = () => (window as any)._rec?.stop()

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze-speech', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: transcript, prompt: prompt.scenario }) })
      const data = await res.json(); setAnalysis(data); setStage('analysis')
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  if (stage === 'selection') {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-8 text-center animate-slide-up shadow-sm max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100/50">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Comm Mentor</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed font-medium italic">Master professional expression.</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => fetchPrompt('read')} disabled={loading} className="p-6 bg-slate-50 border-2 border-transparent hover:border-blue-400 rounded-2xl flex flex-col items-center transition-all group active:scale-95 shadow-sm">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm text-xl group-hover:scale-110 transition-transform">📖</div>
            <span className="font-black text-slate-900 text-xs uppercase tracking-[0.1em]">Read</span>
          </button>
          <button onClick={() => fetchPrompt('listen')} disabled={loading} className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-400 rounded-2xl flex flex-col items-center transition-all group active:scale-95 shadow-sm">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm text-xl group-hover:scale-110 transition-transform">🎧</div>
            <span className="font-black text-slate-900 text-xs uppercase tracking-[0.1em]">Listen</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 animate-slide-up shadow-sm h-[calc(100vh-140px)] flex flex-col">
      {/* Top Bar: Prompt */}
      <div className="bg-blue-50/60 p-6 rounded-2xl mb-6 flex-shrink-0 relative overflow-hidden shadow-inner border border-blue-100/50 min-h-[120px] flex flex-col justify-center">
        <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 block">Communication Block</span>
        <h4 className="text-lg md:text-xl font-bold text-blue-900 leading-snug tracking-tight text-left line-clamp-3">
          {mode === 'read' ? prompt?.scenario : 'Synthesizing Audio Input...'}
        </h4>
      </div>

      {/* Middle: Interaction Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">

        {/* Recorder Column */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 mb-6 relative cursor-pointer ${isRecording ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-110' : 'bg-blue-600 hover:scale-105 shadow-xl shadow-blue-200'}`}>
            <button onClick={isRecording ? stopRecording : startRecording} className="text-white z-10 transition-transform active:scale-75 w-full h-full flex items-center justify-center">
              {isRecording
                ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg>
                : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z M17 11v1h2v-1c0-3.39-2.39-6.22-5.5-6.83V2h-2v2.17C8.39 4.78 6 7.61 6 11v1h2v-1c0-2.21 1.79-4 4-4s4 1.79 4 4z" /></svg>
              }
            </button>
            {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30"></div>}
          </div>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mb-2">{isRecording ? 'Capturing Flow...' : transcript ? 'Buffer Ready' : 'Tap to Record'}</p>
          {stage === 'exercise' && transcript && (
            <div className="flex space-x-2 w-full mt-4">
              <button onClick={() => setTranscript('')} disabled={isRecording} className="flex-1 py-3 text-slate-400 rounded-xl font-bold uppercase tracking-wider text-[9px] hover:bg-slate-200 transition-all border border-slate-200">Retry</button>
              <button onClick={analyze} disabled={loading || isRecording} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-[9px] shadow-lg hover:bg-slate-800 transition-all">{loading ? '...' : 'Analyze'}</button>
            </div>
          )}
        </div>

        {/* Transcript / Analysis Column */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 overflow-y-auto custom-scrollbar relative">
          {!analysis ? (
            <div className="h-full flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Transcript</span>
              <div className="flex-1 italic text-slate-600 text-base font-medium leading-relaxed">
                {transcript || <span className="text-slate-300">Speak naturally...</span>}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Score</span>
                  <span className="text-lg font-black text-indigo-500">{analysis.relevanceScore}</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Fillers</span>
                  <span className="text-lg font-black text-rose-500">{analysis.fillerCount}</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase block">Pacing</span>
                  <span className="text-lg font-black text-emerald-500">Good</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">AI Feedback</span>
                <p className="text-sm text-slate-600 leading-relaxed">{analysis.feedback}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => fetchPrompt(mode!)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold uppercase tracking-wider text-[9px] shadow-sm hover:bg-slate-50">Next</button>
                <button onClick={() => setStage('selection')} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold uppercase tracking-wider text-[9px] hover:bg-slate-300">Menu</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
