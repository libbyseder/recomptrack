import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import LogEntry from './pages/LogEntry'
import Trends from './pages/Trends'
import Insights from './pages/Insights'
import Auth from './pages/Auth'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-emerald-400">Loading RecompTrack...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'chart-line' },
    { path: '/goals', label: 'Goals', icon: 'bullseye' },
    { path: '/log', label: 'Log Entry', icon: 'plus-circle' },
    { path: '/trends', label: 'Trends', icon: 'chart-area' },
    { path: '/insights', label: 'Coach Insights', icon: 'lightbulb' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <i className="fa-solid fa-dumbbell text-white text-2xl"></i>
            </div>
            <div>
              <span className="font-display text-2xl font-semibold tracking-tighter">RecompTrack</span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-[2px] block -mt-1">FFMI + BODY RECOMP</span>
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <div className="text-sm text-zinc-400 hidden md:block">
              {user.email}
            </div>
            <button 
              onClick={handleSignOut}
              className="text-xs px-4 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-2xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-7xl mx-auto px-6 border-t border-zinc-800">
          <div className="flex items-center gap-x-1 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-tab flex items-center gap-x-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition ${
                    isActive ? 'active text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <i className={`fa-solid fa-${item.icon} w-4`}></i>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/goals" element={<Goals user={user} />} />
          <Route path="/log" element={<LogEntry user={user} />} />
          <Route path="/trends" element={<Trends user={user} />} />
          <Route path="/insights" element={<Insights user={user} />} />
        </Routes>
      </div>

      <footer className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-500">
        RecompTrack v0.2 • Real Withings Sync + Auth • Built for serious recompers
      </footer>
    </div>
  )
}

export default App