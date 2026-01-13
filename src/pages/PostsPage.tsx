import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

export default function PostsPage() {
  const { user } = useAppSelector((s) => s.auth)

  return (
    <div className="container">
      <h1>Posts</h1>
      <div className="card">
        <p className="muted">List with pagination will be here.</p>
        {user ? (
          <p>
            <Link to="/posts/new">Create a post</Link>
          </p>
        ) : (
          <p className="muted">Login to create your own posts.</p>
        )}
      </div>
    </div>
  )
}
