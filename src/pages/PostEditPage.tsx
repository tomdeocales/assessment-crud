import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchPostById, updatePost } from '../features/posts/postsSlice'

export default function PostEditPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAppSelector((s) => s.auth)
  const posts = useAppSelector((s) => s.posts)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchPostById(id))
  }, [dispatch, id])

  const post = posts.current

  useEffect(() => {
    if (!post) return
    setTitle(post.title)
    setContent(post.content)
  }, [post])

  const isOwner = Boolean(user && post && post.user_id === user.id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!id) return

    if (!isOwner) {
      setError("You can't edit this post.")
      return
    }

    setLoading(true)
    try {
      const updated = await dispatch(updatePost({ id, title, content })).unwrap()
      navigate(`/posts/${updated.id}`, { replace: true })
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>Edit post</h1>
        <Link to={id ? `/posts/${id}` : '/posts'} className="pill">
          Back
        </Link>
      </div>
      <div className="card">
        {posts.currentStatus === 'loading' ? (
          <p className="muted">Loading...</p>
        ) : null}

        {posts.error ? <div className="error">{posts.error}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        {posts.currentStatus === 'succeeded' && post ? (
          <>
            {!isOwner ? (
              <p className="muted">You can only edit your own post.</p>
            ) : null}

            <form className="form" onSubmit={handleSubmit}>
              <input
                className="input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isOwner}
              />
              <textarea
                className="input"
                placeholder="Write something..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                disabled={!isOwner}
              />

              <button type="submit" disabled={loading || !isOwner}>
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  )
}
