import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { supabase } from '../lib/supabaseClient'

export default function RegisterPage() {
  const auth = useAppSelector((s) => s.auth)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!auth.ready) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (auth.user && !loading) {
    return <Navigate to="/posts" replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!supabase) {
      setError('Missing Supabase setup. Check your .env file.')
      return
    }

    const cleanEmail = email.trim()

    if (!cleanEmail || !password) {
      setError('Please fill up all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      await supabase.auth.signOut()
      navigate('/login', {
        replace: true,
        state: {
          registered: true,
          email: cleanEmail,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Register</h1>
      <div className="card">
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
            autoComplete="new-password"
          />
          <input
            className="input"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
