'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-blue-100 selection:text-blue-600">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-lg shadow-slate-900/10">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">EVIDYA</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/explore" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Explore
            </Link>
            <Link href="/innovation" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Innovation
            </Link>
            <Link href="/auth/signin" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
            <Link href="/explore" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Explore</Link>
            <Link href="/innovation" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Innovation</Link>
            <Link href="/auth/signin" className="text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 blur-[120px] opacity-20 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-teal-300 rounded-full animate-pulse delay-700" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-8 animate-bounce-subtle">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Rethink your future</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-950 mb-8 leading-[1.1] tracking-tight">
            Build proof of how you
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">think</span> — not just a resume.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            EVIDYA helps students record their thinking, growth, and consistency over time. Show the world your innovation journey with a data-backed portfolio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-xl shadow-slate-900/10 active:scale-[0.98]"
            >
              <span>Create Your Profile</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center active:scale-[0.98]"
            >
              Explore Innovation
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Empowering the next generation of innovators
            </h2>
            <p className="text-slate-600 text-lg">
              Everything you need to showcase your potential beyond traditional academic metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-white hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-white shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-950 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full -ml-32 -mb-32" />

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 relative">
            Ready to stand out?
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto relative line-clamp-3">
            Join thousands of students who are building their innovation portfolios and getting noticed by top companies worldwide.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center space-x-2 bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl active:scale-95"
          >
            <span>Get Started for Free</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="font-bold text-slate-900">EVIDYA</span>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-500">© 2024</span>
          </div>
          <div className="flex items-center space-x-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-900">Privacy</Link>
            <Link href="#" className="hover:text-slate-900">Terms</Link>
            <Link href="#" className="hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "Document Ideas",
    description: "Submit your innovations with structured problem statements, technical approaches, and impact analysis.",
    icon: (
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    title: "Track Growth",
    description: "Build a persistent timeline of your thinking journey. Every project, every failure, and every success recorded.",
    icon: (
      <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    title: "Practice Daily",
    description: "Sharpen your logical and technical skills with daily coding challenges and aptitude tests.",
    icon: (
      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    title: "Get Discovered",
    description: "Connect with industry leaders based on your proven thinking process and innovation scores.",
    icon: (
      <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
]
