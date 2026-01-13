import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

export default function RequireAuth() {
  const auth = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!auth.ready) {
    return (
      <div className="container">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (!auth.user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
