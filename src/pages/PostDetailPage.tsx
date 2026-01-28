import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { deletePost, fetchPostById } from '../features/posts/postsSlice'
import { createComment, deleteComment, fetchComments } from '../features/comments/commentsSlice'
import { uploadImage } from '../lib/uploadImage'

export default function PostDetailPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, ready } = useAppSelector((s) => s.auth)
  const posts = useAppSelector((s) => s.posts)
  const comments = useAppSelector((s) => s.comments)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [commentText, setCommentText] = useState('')
  const [commentFile, setCommentFile] = useState<File | null>(null)
  const [commentPreview, setCommentPreview] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [commentSending, setCommentSending] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchPostById(id))
    dispatch(fetchComments(id))
  }, [dispatch, id])

  const post = posts.current
  const canEdit = Boolean(user && post && post.user_id === user.id)

  useEffect(() => {
    if (!commentFile) {
      setCommentPreview(null)
      return
    }

    const url = URL.createObjectURL(commentFile)
    setCommentPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [commentFile])

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

  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return

    setCommentError(null)

    if (!user) {
      setCommentError('Login first to comment.')
      return
    }

    setCommentSending(true)
    try {
      let imageUrl: string | null = null
      if (commentFile) {
        const uploaded = await uploadImage({
          userId: user.id,
          folder: 'comments',
          file: commentFile,
        })
        imageUrl = uploaded.publicUrl
      }

      await dispatch(
        createComment({ postId: id, content: commentText, image_url: imageUrl }),
      ).unwrap()

      setCommentText('')
      setCommentFile(null)
      setCommentPreview(null)
    } catch (e) {
      setCommentError(String(e))
    } finally {
      setCommentSending(false)
    }
  }

  async function handleDeleteComment(commentId: string) {
    const ok = window.confirm('Delete this comment?')
    if (!ok) return

    try {
      await dispatch(deleteComment(commentId)).unwrap()
    } catch {
      // ignore
    }
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>Post</h1>
        <Link to="/posts" className="pill">
          Back
        </Link>
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

            {post.image_url ? (
              <img
                src={post.image_url}
                alt="Post image"
                className="post-image"
                loading="lazy"
              />
            ) : null}

            <div className="post-content">{post.content}</div>

            {ready && canEdit ? (
              <div className="actions">
                <Link to={`/posts/${post.id}/edit`} className="pill">
                  Edit
                </Link>
                <button
                  type="button"
                  className="danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="card comment-card">
        <h2>Comments</h2>

        {comments.error ? <div className="error">{comments.error}</div> : null}

        {ready && user ? (
          <form className="form" onSubmit={handleSendComment}>
            {commentError ? <div className="error">{commentError}</div> : null}

            <textarea
              className="input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />

            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setCommentFile(e.target.files?.[0] ?? null)}
            />

            {commentPreview ? (
              <img
                src={commentPreview}
                alt="Preview"
                className="preview-img"
                loading="lazy"
              />
            ) : null}

            <button type="submit" disabled={commentSending}>
              {commentSending ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        ) : (
          <p className="muted">Login to add a comment.</p>
        )}

        {comments.status === 'loading' ? <p className="muted">Loading...</p> : null}

        <div className="comment-list">
          {comments.items.map((c) => {
            const canDelete = Boolean(user && c.user_id === user.id)

            return (
              <div key={c.id} className="comment-row">
                <div className="comment-top">
                  <div className="comment-name">
                    {c.username?.trim() ? c.username : 'unknown'}
                  </div>
                  <div className="muted comment-date">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      className="link danger-link"
                      onClick={() => handleDeleteComment(c.id)}
                    >
                      delete
                    </button>
                  ) : null}
                </div>

                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt="Comment"
                    className="comment-image"
                    loading="lazy"
                  />
                ) : null}
                {c.content ? <div className="comment-text">{c.content}</div> : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
