'use client'

import { useSession } from 'next-auth/react'
import Sidebar from './Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  if (!session) {
    return <div className="min-h-screen bg-slate-50">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-slate-50 max-w-full overflow-x-hidden antialiased">
      <Sidebar />
      {/* Structural Fix: min-w-0 is required to prevent child overflow from expanding flex item width */}
      <main className="flex-1 min-w-0 w-full lg:ml-64 p-4 md:p-6 lg:p-8 pt-20 lg:pt-10">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
