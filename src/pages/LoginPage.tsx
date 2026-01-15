import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { supabase } from '../lib/supabaseClient'

type LoginLocationState = {
  from?: { pathname: string }
  registered?: boolean
  email?: string
}

export default function LoginPage() {
  const auth = useAppSelector((s) => s.auth)
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as LoginLocationState | null

  const [email, setEmail] = useState(() => state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fromPath =
    state?.from?.pathname ?? '/posts'

  if (!auth.ready) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (auth.user) {
    return <Navigate to="/posts" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!supabase) {
      setError('Missing Supabase setup. Check your .env file.')
      return
    }

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      navigate(fromPath, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <div className="card">
        {state?.registered ? (
          <div className="success">
            Your account has been successfully created. Please login.
          </div>
        ) : null}
        {error ? <div className="error">{error}</div> : null}

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
