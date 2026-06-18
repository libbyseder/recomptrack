import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'magic' | 'signup'>('magic')

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Check your email for the magic link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-3xl flex items-center justify-center">
              <i className="fa-solid fa-dumbbell text-white text-3xl"></i>
            </div>
            <span className="font-display text-4xl font-semibold tracking-tighter">RecompTrack</span>
          </div>
          <p className="text-zinc-400">Build muscle. Drop fat. Hit your FFMI &amp; BF% goals.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8">
          <div className="flex mb-6 border-b border-zinc-700">
            <button 
              onClick={() => setMode('magic')}
              className={`flex-1 pb-3 text-sm font-medium ${mode === 'magic' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400'}`}
            >
              Magic Link
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 pb-3 text-sm font-medium ${mode === 'signup' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-zinc-400'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleMagicLink}>
            <div className="mb-6">
              <label className="block text-xs text-zinc-400 mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl px-4 py-3 text-sm focus:border-emerald-400 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 transition font-semibold rounded-2xl flex items-center justify-center gap-x-2"
            >
              {loading ? 'Sending...' : mode === 'magic' ? 'Send Magic Link' : 'Create Account & Send Link'}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-400 mt-6">
            No password needed. We’ll email you a secure link.
          </p>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Built for people serious about body recomposition.
        </p>
      </div>
    </div>
  )
}