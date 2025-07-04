import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useUserRole } from './useUserRole'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 使用用户角色管理 Hook
  const { userProfile, isAdmin, loading: roleLoading } = useUserRole(user)

  useEffect(() => {
    let mounted = true

    // 获取当前会话
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('获取会话失败:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('认证状态变化:', event, session?.user?.email)
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        if (!loading) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // 登录成功后立即更新用户状态
    if (data.user && !error) {
      setUser(data.user)
      setSession(data.session)
    }
    
    return { data, error }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error }
  }, [])

  return {
    user,
    session,
    userProfile,
    isAdmin,
    loading: loading || roleLoading,
    signIn,
    signUp,
    signOut,
  }
} 