import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { createPost } from '../features/posts/postsSlice'
import { uploadImage } from '../lib/uploadImage'

export default function PostCreatePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const auth = useAppSelector((s) => s.auth)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }

    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!auth.user) {
      setError('You need to login first.')
      return
    }

    setLoading(true)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        const uploaded = await uploadImage({
          userId: auth.user.id,
          folder: 'posts',
          file: imageFile,
        })
        imageUrl = uploaded.publicUrl
      }

      const created = await dispatch(
        createPost({ title, content, image_url: imageUrl }),
      ).unwrap()
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
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          {imagePreview ? (
            <div className="image-box">
              <img
                src={imagePreview}
                alt="Preview"
                className="preview-img"
                loading="lazy"
              />
              <button
                type="button"
                className="remove-img-btn"
                onClick={() => setImageFile(null)}
              >
                x
              </button>
            </div>
          ) : null}
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
