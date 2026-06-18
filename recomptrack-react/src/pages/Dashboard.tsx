import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, BodyLog } from '../lib/supabase'
import toast from 'react-hot-toast'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  const [logs, setLogs] = useState<BodyLog[]>([])
  const [withingsConnected, setWithingsConnected] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const heightCm = 161.3 // TODO: Make this editable per user in profile

  useEffect(() => {
    fetchLogs()
    checkWithingsConnection()
  }, [user.id])

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('body_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10)

    if (!error && data) setLogs(data)
  }

  const checkWithingsConnection = async () => {
    const { data } = await supabase
      .from('withings_tokens')
      .select('last_synced')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setWithingsConnected(true)
      setLastSync(data.last_synced)
    }
  }

  const connectWithings = () => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/withings-auth/start?user_id=${user.id}`
    window.open(url, '_blank', 'width=620,height=720')
    toast('Complete authorization in the new tab, then click Sync Now')
  }

  const syncWithings = async () => {
    setSyncing(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/withings-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ user_id: user.id, height_cm: heightCm })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Sync failed')

      toast.success(`Synced ${data.synced || 0} measurements from Withings!`)
      await fetchLogs()
      await checkWithingsConnection()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSyncing(false)
    }
  }

  // Calculate latest metrics (simplified for demo)
  const latest = logs[0]
  const currentWeight = latest ? latest.weight_kg : null
  const currentBF = latest ? latest.bf : null

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-display text-5xl font-semibold tracking-tighter">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Your recomp at a glance</p>
        </div>
        <button 
          onClick={syncWithings}
          disabled={syncing || !withingsConnected}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 rounded-2xl text-sm font-medium flex items-center gap-x-2 transition"
        >
          {syncing ? 'Syncing...' : 'Sync Withings Now'}
        </button>
      </div>

      {/* Withings Status */}
      <div className="mb-8 p-5 bg-zinc-900 border border-emerald-500/30 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <i className="fa-solid fa-link text-2xl text-emerald-400"></i>
          <div>
            <div className="font-semibold">Withings Scale</div>
            <div className={`text-xs ${withingsConnected ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {withingsConnected ? 'Connected' : 'Not connected'}
            </div>
          </div>
        </div>
        
        {!withingsConnected ? (
          <button onClick={connectWithings} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-sm font-medium">
            Connect Withings
          </button>
        ) : (
          <div className="text-xs text-zinc-400">
            Last sync: {lastSync ? new Date(lastSync).toLocaleDateString() : 'Never'}
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="metric-label text-emerald-400">Weight</div>
          <div className="text-5xl font-semibold tabular-nums tracking-tighter mt-2">
            {currentWeight ? currentWeight.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">kg</div>
        </div>

        <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="metric-label text-orange-400">Body Fat</div>
          <div className="text-5xl font-semibold tabular-nums tracking-tighter mt-2">
            {currentBF ? currentBF.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">%</div>
        </div>

        <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="metric-label text-sky-400">FFMI</div>
          <div className="text-5xl font-semibold tabular-nums tracking-tighter mt-2">
            {latest?.ffmi ? latest.ffmi.toFixed(2) : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">Fat Free Mass Index</div>
        </div>

        <div className="metric-card bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="metric-label text-teal-400">Lean Mass</div>
          <div className="text-5xl font-semibold tabular-nums tracking-tighter mt-2">
            {currentWeight && currentBF ? (currentWeight * (1 - currentBF / 100)).toFixed(1) : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">kg</div>
        </div>
      </div>

      <div className="text-xs text-zinc-400">
        Recent logs: {logs.length} • Last entry: {latest ? new Date(latest.date).toLocaleDateString() : 'None yet'}
      </div>
    </div>
  )
}