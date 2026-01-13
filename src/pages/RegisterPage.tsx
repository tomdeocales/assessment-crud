import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="container">
      <h1>Register</h1>
      <div className="card">
        <p className="muted">To be implemented</p>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
