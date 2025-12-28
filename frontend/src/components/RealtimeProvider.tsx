import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth()

  useEffect(() => {
    if (!userProfile) return

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel(`notifications:${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userProfile.id}`,
        },
        (payload) => {
          // Show notification toast or update notification count
          console.log('New notification:', payload.new)
          // You could use a toast library here
        }
      )
      .subscribe()

    return () => {
      notificationsChannel.unsubscribe()
    }
  }, [userProfile])

  return <>{children}</>
}

