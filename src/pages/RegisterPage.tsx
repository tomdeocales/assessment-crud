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
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
    setInfo(null)

    if (!supabase) {
      setError('Missing Supabase setup. Check your .env file.')
      return
    }

    if (!email.trim() || !password) {
      setError('Please fill up all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session) {
        navigate('/posts', { replace: true })
      } else {
        setInfo('Account created. Please check your email to confirm.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Register</h1>
      <div className="card">
        {error ? <div className="error">{error}</div> : null}
        {info ? <p className="muted">{info}</p> : null}

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
