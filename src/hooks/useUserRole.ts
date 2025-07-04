import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../types/supabase'

export const useUserRole = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserProfile()
    } else {
      setUserProfile(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }, [user?.id]) // 只依赖user.id，避免不必要的重新渲染

  const loadUserProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      console.log('正在加载用户资料:', user.email)
      
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (error) {
        // 如果用户资料不存在，创建一个默认的用户记录
        if (error.code === 'PGRST116') {
          console.log('用户资料不存在，尝试创建...')
          await createUserProfile(user.id)
          // 创建后直接设置默认值，不再递归调用
          setUserProfile({
            id: null,
            auth_user_id: user.id,
            role: 'user',
            created_at: null,
            email: user.email || null
          })
          setIsAdmin(false)
          return
        }
        console.error('加载用户资料时发生错误:', error)
        // 对于其他错误，设置默认值
        setUserProfile({
          id: null,
          auth_user_id: user.id,
          role: 'user',
          created_at: null,
          email: user.email || null
        })
        setIsAdmin(false)
        return
      }

      console.log('用户资料加载成功:', data?.role)
      setUserProfile(data)
      setIsAdmin(data.role === 'admin')
    } catch (error: any) {
      console.error('加载用户资料失败:', error)
      // 出错时也设置默认值
      setUserProfile({
        id: null,
        auth_user_id: user.id,
        role: 'user',
        created_at: null,
        email: user.email || null
      })
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (authUserId: string) => {
    try {
      console.log('尝试创建用户资料，用户ID:', authUserId)
      
      // 使用 upsert 来避免冲突
      const { data, error } = await supabase
        .from('users')
        .upsert({
          auth_user_id: authUserId,
          role: 'user'
        }, {
          onConflict: 'auth_user_id'
        })
        .select()

      if (error) {
        console.error('创建/更新用户资料失败:', error)
        return
      }
      
      console.log('用户资料创建/更新成功:', data)
    } catch (error: any) {
      console.error('创建用户资料时发生异常:', error)
    }
  }

  const updateUserRole = async (newRole: 'user' | 'admin') => {
    if (!user || !userProfile) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('auth_user_id', user.id)

      if (error) throw error

      // 更新本地状态
      setUserProfile({ ...userProfile, role: newRole })
      setIsAdmin(newRole === 'admin')
    } catch (error: any) {
      console.error('更新用户角色失败:', error)
      throw error
    }
  }

  return {
    userProfile,
    isAdmin,
    loading,
    updateUserRole,
    refreshProfile: loadUserProfile
  }
} 