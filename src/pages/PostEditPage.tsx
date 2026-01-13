import { useParams } from 'react-router-dom'

export default function PostEditPage() {
  const { id } = useParams()

  return (
    <div className="container">
      <h1>Edit post</h1>
      <div className="card">
        <p className="muted">Post id: {id}</p>
        <p className="muted">Edit page will be here.</p>
      </div>
    </div>
  )
}
