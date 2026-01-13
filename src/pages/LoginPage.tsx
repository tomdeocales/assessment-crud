import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="container">
      <h1>Login</h1>
      <div className="card">
        <p className="muted">To be implemented</p>
        <p>
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}
