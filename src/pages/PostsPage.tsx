import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { fetchPosts } from '../features/posts/postsSlice'

export default function PostsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const posts = useAppSelector((s) => s.posts)
  const [searchParams, setSearchParams] = useSearchParams()

  const page = useMemo(() => {
    const raw = searchParams.get('page')
    const parsed = raw ? Number(raw) : 1
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
  }, [searchParams])

  useEffect(() => {
    dispatch(fetchPosts({ page, pageSize: posts.pageSize }))
  }, [dispatch, page, posts.pageSize])

  const totalPages = Math.max(1, Math.ceil(posts.total / posts.pageSize))

  function goToPage(nextPage: number) {
    const safe = Math.min(Math.max(1, nextPage), totalPages)
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev)
      if (safe === 1) sp.delete('page')
      else sp.set('page', String(safe))
      return sp
    })
  }

  return (
    <div className="container">
      <div className="page-title">
        <h1>Posts</h1>
        {user ? (
          <Link to="/posts/new" className="pill">
            Create
          </Link>
        ) : null}
      </div>
      <div className="card">
        {posts.listStatus === 'loading' ? <p className="muted">Loading...</p> : null}
        {posts.error ? <div className="error">{posts.error}</div> : null}

        {posts.listStatus === 'succeeded' && posts.items.length === 0 ? (
          <p className="muted">No posts yet.</p>
        ) : null}

        <div className="post-list">
          {posts.items.map((p) => {
            const dateLabel = new Date(p.created_at).toLocaleString()
            const username = p.username?.trim() ? p.username : 'unknown'
            const snippet =
              p.content.length > 140 ? `${p.content.slice(0, 140)}...` : p.content

            return (
              <Link key={p.id} to={`/posts/${p.id}`} className="post-row">
                <div className="post-row-main">
                  <div className="post-title">{p.title}</div>
                  <div className="muted post-meta">
                    {username} • {dateLabel}
                  </div>
                  <div className="post-snippet">{snippet}</div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="pagination">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>

          <span className="muted">
            Page {page} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>

        {!user ? <p className="muted">Login to create and edit posts.</p> : null}
      </div>
    </div>
  )
}
