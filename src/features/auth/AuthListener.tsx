import { useEffect } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { supabase } from '../../lib/supabaseClient'
import { setSession } from './authSlice'

type Props = {
  children: React.ReactNode
}

export function AuthListener({ children }: Props) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!supabase) {
      dispatch(setSession(null))
      return
    }

    let ignore = false

    supabase.auth.getSession().then(({ data }) => {
      if (ignore) return
      dispatch(setSession(data.session))
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session))
    })

    return () => {
      ignore = true
      data.subscription.unsubscribe()
    }
  }, [dispatch])

  return children
}
