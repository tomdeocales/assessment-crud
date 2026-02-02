import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { supabase } from '../../lib/supabaseClient'

export type Post = {
  id: string
  user_id: string
  username: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string | null
}

type PostsState = {
  items: Post[]
  total: number
  page: number
  pageSize: number
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  current: Post | null
  currentStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: PostsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 5,
  listStatus: 'idle',
  current: null,
  currentStatus: 'idle',
  error: null,
}

function emailToUsername(email: string | null | undefined) {
  if (!email) return ''
  const at = email.indexOf('@')
  if (at === -1) return email
  return email.slice(0, at)
}

export const fetchPosts = createAsyncThunk<
  { items: Post[]; total: number; page: number; pageSize: number },
  { page: number; pageSize: number },
  { rejectValue: string }
>('posts/fetchPosts', async (args, { rejectWithValue }) => {
    if (!supabase) return rejectWithValue('Supabase is not configured')

    const page = Math.max(1, args.page)
    const pageSize = Math.max(1, args.pageSize)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('id,user_id,username,title,content,image_url,created_at,updated_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) return rejectWithValue(error.message)

    return {
      items: (data ?? []) as Post[],
      total: count ?? 0,
      page,
      pageSize,
    }
  })

export const fetchPostById = createAsyncThunk<Post, string, { rejectValue: string }>(
  'posts/fetchPostById',
  async (id, { rejectWithValue }) => {
    if (!supabase) return rejectWithValue('Supabase is not configured')

    const { data, error } = await supabase
      .from('posts')
      .select('id,user_id,username,title,content,image_url,created_at,updated_at')
      .eq('id', id)
      .single()

    if (error) return rejectWithValue(error.message)

    return data as Post
  },
)

export const createPost = createAsyncThunk<
  Post,
  { title: string; content: string; image_url?: string | null },
  { rejectValue: string; state: RootState }
>('posts/createPost', async (args, { getState, rejectWithValue }) => {
    if (!supabase) return rejectWithValue('Supabase is not configured')

    const state = getState() as RootState
    const user = state.auth.user
    if (!user) return rejectWithValue('You must be logged in')

    const title = args.title.trim()
    const content = args.content.trim()
    if (!title || !content) return rejectWithValue('Title and content are required')

    const username = emailToUsername(user.email)
    const image_url = args.image_url ?? null

    const { data, error } = await supabase
      .from('posts')
      .insert({ title, content, user_id: user.id, username, image_url })
      .select('id,user_id,username,title,content,image_url,created_at,updated_at')
      .single()

    if (error) return rejectWithValue(error.message)

    return data as Post
  })

export const updatePost = createAsyncThunk<
  Post,
  { id: string; title: string; content: string; image_url?: string | null },
  { rejectValue: string; state: RootState }
>('posts/updatePost', async (args, { getState, rejectWithValue }) => {
    if (!supabase) return rejectWithValue('Supabase is not configured')

    const state = getState() as RootState
    const user = state.auth.user
    if (!user) return rejectWithValue('You must be logged in')

    const title = args.title.trim()
    const content = args.content.trim()
    if (!title || !content) return rejectWithValue('Title and content are required')

    // build update data
    const updateData: Record<string, unknown> = {
      title,
      content,
      updated_at: new Date().toISOString(),
    }
    if (args.image_url !== undefined) {
      updateData.image_url = args.image_url
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', args.id)
      .eq('user_id', user.id)
      .select('id,user_id,username,title,content,image_url,created_at,updated_at')
      .single()

    if (error) return rejectWithValue(error.message)

    return data as Post
  })

export const deletePost = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('posts/deletePost', async (id, { getState, rejectWithValue }) => {
    if (!supabase) return rejectWithValue('Supabase is not configured')

    const state = getState() as RootState
    const user = state.auth.user
    if (!user) return rejectWithValue('You must be logged in')

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return rejectWithValue(error.message)

    return id
  })

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null
      state.currentStatus = 'idle'
      state.error = null
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = Math.max(1, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
      .addCase(fetchPostById.pending, (state) => {
        state.currentStatus = 'loading'
        state.error = null
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
      .addCase(createPost.pending, (state) => {
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.current = action.payload
        state.currentStatus = 'succeeded'
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
      .addCase(updatePost.pending, (state) => {
        state.error = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.current = action.payload
        state.currentStatus = 'succeeded'
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
      .addCase(deletePost.pending, (state) => {
        state.error = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedId = action.payload
        state.items = state.items.filter((p) => p.id !== deletedId)
        state.total = Math.max(0, state.total - 1)
        if (state.current?.id === deletedId) state.current = null
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
  },
})

export const { clearCurrent, setPageSize } = postsSlice.actions
export default postsSlice.reducer
