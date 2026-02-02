import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchPostById, updatePost } from '../features/posts/postsSlice'
import { uploadImage } from '../lib/uploadImage'

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

  // image states
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)

  useEffect(() => {
    if (!id) return
    dispatch(fetchPostById(id))
  }, [dispatch, id])

  const post = posts.current

  useEffect(() => {
    if (!post) return
    setTitle(post.title)
    setContent(post.content)
    setExistingImageUrl(post.image_url)
  }, [post])

  // preview for new image
  useEffect(() => {
    if (!newImageFile) {
      setNewImagePreview(null)
      return
    }
    const url = URL.createObjectURL(newImageFile)
    setNewImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [newImageFile])

  const isOwner = Boolean(user && post && post.user_id === user.id)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setNewImageFile(file)
      setExistingImageUrl(null)
      setImageRemoved(false)
    }
  }

  function handleRemoveImage() {
    setNewImageFile(null)
    setExistingImageUrl(null)
    setImageRemoved(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!id) return

    if (!isOwner) {
      setError("You can't edit this post.")
      return
    }

    if (!user) {
      setError('You need to login first.')
      return
    }

    setLoading(true)
    try {
      let imageUrl: string | null | undefined = undefined

      if (newImageFile) {
        // upload new image
        const uploaded = await uploadImage({
          userId: user.id,
          folder: 'posts',
          file: newImageFile,
        })
        imageUrl = uploaded.publicUrl
      } else if (imageRemoved) {
        // user removed the image
        imageUrl = null
      }

      const updated = await dispatch(
        updatePost({ id, title, content, image_url: imageUrl })
      ).unwrap()
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

              {/* existing image */}
              {existingImageUrl && !newImagePreview && (
                <div className="image-box">
                  <img
                    src={existingImageUrl}
                    alt="Current"
                    className="preview-img"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={handleRemoveImage}
                    disabled={!isOwner}
                  >
                    x
                  </button>
                </div>
              )}

              {/* new image preview */}
              {newImagePreview && (
                <div className="image-box">
                  <img
                    src={newImagePreview}
                    alt="New"
                    className="preview-img"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="remove-img-btn"
                    onClick={handleRemoveImage}
                  >
                    x
                  </button>
                </div>
              )}

              {/* file input - show when no image */}
              {!existingImageUrl && !newImagePreview && (
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={!isOwner}
                />
              )}

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
