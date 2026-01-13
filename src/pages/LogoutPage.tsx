import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function LogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false

    async function run() {
      if (!supabase) {
        navigate('/login', { replace: true })
        return
      }

      await supabase.auth.signOut()
      if (ignore) return
      navigate('/login', { replace: true })
    }

    run()

    return () => {
      ignore = true
    }
  }, [navigate])

  return (
    <div className="container">
      <div className="card">Logging out...</div>
    </div>
  )
}
