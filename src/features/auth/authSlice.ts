import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { Session, User } from '@supabase/supabase-js'

type AuthState = {
  session: Session | null
  user: User | null
  ready: boolean
}

const initialState: AuthState = {
  session: null,
  user: null,
  ready: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload
      state.user = action.payload?.user ?? null
      state.ready = true
    },
  },
})

export const { setSession } = authSlice.actions
export default authSlice.reducer
