import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { supabase } from '../../lib/supabaseClient'

export type Comment = {
  id: string
  post_id: string
  user_id: string
  username: string
  content: string
  image_url: string | null
  created_at: string
}

type CommentsState = {
  postId: string | null
  items: Comment[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CommentsState = {
  postId: null,
  items: [],
  status: 'idle',
  error: null,
}

function emailToUsername(email: string | null | undefined) {
  if (!email) return ''
  const at = email.indexOf('@')
  if (at === -1) return email
  return email.slice(0, at)
}

export const fetchComments = createAsyncThunk<
  { postId: string; items: Comment[] },
  string,
  { rejectValue: string }
>('comments/fetchComments', async (postId, { rejectWithValue }) => {
  if (!supabase) return rejectWithValue('Supabase is not configured')

  const { data, error } = await supabase
    .from('comments')
    .select('id,post_id,user_id,username,content,image_url,created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return rejectWithValue(error.message)

  return {
    postId,
    items: (data ?? []) as Comment[],
  }
})

export const createComment = createAsyncThunk<
  Comment,
  { postId: string; content: string; image_url?: string | null },
  { rejectValue: string; state: RootState }
>('comments/createComment', async (args, { getState, rejectWithValue }) => {
  if (!supabase) return rejectWithValue('Supabase is not configured')

  const state = getState()
  const user = state.auth.user
  if (!user) return rejectWithValue('You must be logged in')

  const content = args.content.trim()
  const image_url = args.image_url ?? null
  if (!content && !image_url) {
    return rejectWithValue('Write a comment or add an image.')
  }

  const username = emailToUsername(user.email)

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: args.postId,
      user_id: user.id,
      username,
      content,
      image_url,
    })
    .select('id,post_id,user_id,username,content,image_url,created_at')
    .single()

  if (error) return rejectWithValue(error.message)

  return data as Comment
})

export const deleteComment = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: RootState }
>('comments/deleteComment', async (id, { getState, rejectWithValue }) => {
  if (!supabase) return rejectWithValue('Supabase is not configured')

  const state = getState()
  const user = state.auth.user
  if (!user) return rejectWithValue('You must be logged in')

  const { error } = await supabase.from('comments').delete().eq('id', id).eq('user_id', user.id)
  if (error) return rejectWithValue(error.message)

  return id
})

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments(state) {
      state.postId = null
      state.items = []
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.postId = action.payload.postId
        state.items = action.payload.items
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
      .addCase(createComment.fulfilled, (state, action) => {
        if (state.postId && state.postId !== action.payload.post_id) return
        state.items.push(action.payload)
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload)
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Error'
      })
  },
})

export const { clearComments } = commentsSlice.actions
export default commentsSlice.reducer
