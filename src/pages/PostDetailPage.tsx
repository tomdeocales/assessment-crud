import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { deletePost, fetchPostById } from '../features/posts/postsSlice'

export default function PostDetailPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, ready } = useAppSelector((s) => s.auth)
  const posts = useAppSelector((s) => s.posts)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchPostById(id))
  }, [dispatch, id])

  const post = posts.current
  const canEdit = Boolean(user && post && post.user_id === user.id)

  async function handleDelete() {
    if (!id) return
    const ok = window.confirm('Delete this post?')
    if (!ok) return

    setDeleteError(null)
    setDeleting(true)
    try {
      await dispatch(deletePost(id)).unwrap()
      navigate('/posts', { replace: true })
    } catch (e) {
      setDeleteError(String(e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>Post</h1>
        <Link to="/posts">Back</Link>
      </div>
      <div className="card">
        {posts.currentStatus === 'loading' ? (
          <p className="muted">Loading...</p>
        ) : null}

        {posts.error ? <div className="error">{posts.error}</div> : null}
        {deleteError ? <div className="error">{deleteError}</div> : null}

        {posts.currentStatus === 'succeeded' && post ? (
          <>
            <h2 className="post-title-big">{post.title}</h2>
            <div className="muted">
              {(post.username?.trim() ? post.username : 'unknown') + ' • '}
              {new Date(post.created_at).toLocaleString()}
              {post.updated_at ? (
                <>
                  {' '}
                  • updated {new Date(post.updated_at).toLocaleString()}
                </>
              ) : null}
            </div>

            <div className="post-content">{post.content}</div>

            {ready && canEdit ? (
              <div className="actions">
                <Link to={`/posts/${post.id}/edit`}>Edit</Link>
                <button type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
