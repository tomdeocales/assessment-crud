import { useParams } from 'react-router-dom'

export default function PostDetailPage() {
  const { id } = useParams()

  return (
    <div className="container">
      <h1>Post</h1>
      <div className="card">
        <p className="muted">Post id: {id}</p>
        <p className="muted">View page will be here.</p>
      </div>
    </div>
  )
}
