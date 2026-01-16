import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { supabase } from '../lib/supabaseClient'

export default function LogoutPage() {
  const auth = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogout() {
    setError(null)

    if (!supabase) {
      setError('Missing Supabase setup. Check your .env file.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
        return
      }

      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  if (!auth.ready) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (!auth.user) {
    return (
      <div className="container">
        <h1>Logout</h1>
        <div className="card">
          <p className="muted">You are already logged out.</p>
          <p>
            <Link to="/login">Go to login</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Logout</h1>
      <div className="card">
        {error ? <div className="error">{error}</div> : null}
        <p className="muted">Are you sure you want to logout?</p>
        <button type="button" onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}
