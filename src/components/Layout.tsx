import { NavLink, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export default function Layout() {
  const { user } = useAppSelector((s) => s.auth)

  function getNavClass({ isActive }: { isActive: boolean }) {
    return isActive ? 'navlink active' : 'navlink'
  }

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/posts" className={getNavClass}>
            Simple Blog
          </NavLink>
          <div className="spacer" />
          {user ? (
            <>
              <span className="muted">{user.email}</span>
              <NavLink to="/logout" className={getNavClass}>
                Logout
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={getNavClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={getNavClass}>
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
