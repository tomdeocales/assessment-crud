import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createPost } from '../features/posts/postsSlice'

export default function PostCreatePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const auth = useAppSelector((s) => s.auth)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!auth.user) {
      setError('You need to login first.')
      return
    }

    setLoading(true)
    try {
      const created = await dispatch(createPost({ title, content })).unwrap()
      navigate(`/posts/${created.id}`, { replace: true })
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>Create post</h1>
        <button
          type="button"
          className="secondary"
          onClick={() => navigate('/posts')}
        >
          Back
        </button>
      </div>
      <div className="card">
        {error ? <div className="error">{error}</div> : null}

        <form className="form" onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input"
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  )
}
