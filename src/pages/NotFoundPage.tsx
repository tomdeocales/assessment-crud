import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container">
      <h1>Not found</h1>
      <div className="card">
        <p className="muted">
          The page you are trying to open doesn&apos;t exist.
        </p>
        <p>
          <Link to="/posts" className="pill">
            Go back to posts
          </Link>
        </p>
      </div>
    </div>
  )
}
