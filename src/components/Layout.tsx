import { NavLink, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export default function Layout() {
  const { user } = useAppSelector((s) => s.auth)

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/posts" className="navlink">
            Simple Blog
          </NavLink>
          <div className="spacer" />
          {user ? (
            <span className="muted">{user.email}</span>
          ) : (
            <>
              <NavLink to="/login" className="navlink">
                Login
              </NavLink>
              <NavLink to="/register" className="navlink">
                Register
              </NavLink>
            </>
          )}
        </div>
      </header>

      {!isSupabaseConfigured ? (
        <div className="container">
          <div className="error">
            Missing Supabase env vars. Add <b>VITE_SUPABASE_URL</b> and{' '}
            <b>VITE_SUPABASE_ANON_KEY</b> to your <b>.env</b> file.
          </div>
        </div>
      ) : null}

      <Outlet />
    </div>
  )
}
