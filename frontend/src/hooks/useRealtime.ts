import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { Post, Comment, Reaction } from '../types'

export function useRealtimePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    // Subscribe to post updates
    const postChannel = supabase
      .channel(`post:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setPost(payload.new as Post)
          }
        }
      )
      .subscribe()

    // Subscribe to comment updates
    const commentsChannel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setComments((prev) => [...prev, payload.new as Comment])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          setComments((prev) =>
            prev.map((c) => (c.id === payload.new.id ? (payload.new as Comment) : c))
          )
        }
      )
      .subscribe()

    return () => {
      postChannel.unsubscribe()
      commentsChannel.unsubscribe()
    }
  }, [postId])

  return { post, comments, setPost, setComments }
}

export function useRealtimeReactions(postId: string) {
  const [reactions, setReactions] = useState<Reaction[]>([])

  useEffect(() => {
    const channel = supabase
      .channel(`reactions:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReactions((prev) => [...prev, payload.new as Reaction])
          } else if (payload.eventType === 'DELETE') {
            setReactions((prev) => prev.filter((r) => r.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setReactions((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Reaction) : r))
            )
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [postId])

  return { reactions, setReactions }
}

export function useRealtimeVotes(votableType: 'post' | 'comment', votableId: string) {
  const [voteCount, setVoteCount] = useState({ upvotes: 0, downvotes: 0 })

  useEffect(() => {
    const channel = supabase
      .channel(`votes:${votableType}:${votableId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `votable_type=eq.${votableType} AND votable_id=eq.${votableId}`,
        },
        () => {
          // Refetch vote counts (or calculate from votes)
          // For simplicity, we'll just trigger a refetch
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [votableType, votableId])

  return { voteCount, setVoteCount }
}

