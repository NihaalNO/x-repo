import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Post, Comment, Reaction } from '../types'
import { useAuth } from '../contexts/AuthContext'
import ReactMarkdown from 'react-markdown'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const wsRef = useRef<WebSocket | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loadingBookmark, setLoadingBookmark] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [loadingReport, setLoadingReport] = useState(false)
  
  const connectWebSocket = useCallback(() => {
    if (!userProfile || !id) return
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/api/reactions/ws/${id}`
    
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    
    ws.onopen = () => {
      console.log('Connected to reactions WebSocket')
      setWsConnected(true)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'reaction_update') {
          setReactions(data.reactions)
          // Update user reactions
          if (userProfile) {
            const userReactionMap: Record<string, boolean> = {}
            data.reactions.forEach((reaction: Reaction) => {
              if (reaction.user_id === userProfile.id) {
                userReactionMap[reaction.reaction_type] = true
              }
            })
            setUserReactions(userReactionMap)
          }
        } else if (data.type === 'reaction_removed') {
          fetchReactions() // Refresh reactions
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }
    
    ws.onclose = () => {
      console.log('Disconnected from reactions WebSocket')
      setWsConnected(false)
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          connectWebSocket()
        }
      }, 3000)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }, [userProfile, id])

  useEffect(() => {
    if (id) {
      fetchPost()
      fetchComments()
      fetchReactions()
      fetchBookmarkStatus()
    }
  }, [id])
  
  useEffect(() => {
    if (userProfile && id) {
      connectWebSocket()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [userProfile, id, connectWebSocket])

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`)
      setPost(response.data)
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${id}/comments`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }
  
  const fetchReactions = async () => {
    try {
      const response = await api.get(`/reactions/posts/${id}`)
      setReactions(response.data.reactions || [])
      
      // Update user reactions
      if (userProfile) {
        const userReactionMap: Record<string, boolean> = {}
        response.data.reactions.forEach((reaction: Reaction) => {
          if (reaction.user_id === userProfile.id) {
            userReactionMap[reaction.reaction_type] = true
          }
        })
        setUserReactions(userReactionMap)
      }
    } catch (error) {
      console.error('Failed to fetch reactions:', error)
    }
  }
  
  const fetchBookmarkStatus = async () => {
    if (!userProfile || !id) return;
    
    try {
      const response = await api.get(`/bookmarks/check/${id}`);
      setIsBookmarked(response.data.bookmarked);
    } catch (error) {
      console.error('Failed to fetch bookmark status:', error);
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!userProfile) {
      navigate('/login')
      return
    }
    try {
      await api.post(`/posts/${id}/vote`, null, { params: { vote_type: voteType } })
      const newVote = userVote === voteType ? null : voteType
      setUserVote(newVote)
      if (post) {
        const upvoteChange = newVote === 'upvote' ? 1 : userVote === 'upvote' ? -1 : 0
        const downvoteChange = newVote === 'downvote' ? 1 : userVote === 'downvote' ? -1 : 0
        setPost({
          ...post,
          upvotes: post.upvotes + upvoteChange,
          downvotes: post.downvotes + downvoteChange,
        })
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }
  
  const handleReaction = (reactionType: string) => {
    if (!userProfile) {
      navigate('/login')
      return
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'add_reaction',
        reaction_type: reactionType
      }))
    } else {
      // Fallback to API call if WebSocket is not connected
      api.post('/reactions', {
        post_id: id,
        reaction_type: reactionType
      }).then(() => {
        fetchReactions()
      }).catch(error => {
        console.error('Failed to add reaction:', error)
      })
    }
  }
  
  const getReactionCount = (reactionType: string) => {
    return reactions.filter(r => r.reaction_type === reactionType).length
  }
  
  const toggleBookmark = async () => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    
    setLoadingBookmark(true);
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
      } else {
        await api.post('/bookmarks', { post_id: id });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoadingBookmark(false);
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile || !commentText.trim()) return

    try {
      await api.post('/comments', {
        post_id: id,
        content: commentText,
      })
      setCommentText('')
      fetchComments()
    } catch (error) {
      console.error('Failed to post comment:', error)
    }
  }

  const renderComment = (comment: Comment, depth = 0) => {
    if (depth > 5) return null // Max depth

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  // Handle comment vote
                }}
                className="text-sm hover:text-primary-600"
              >
                ▲
              </button>
              <span className="text-xs font-medium">{comment.upvotes - comment.downvotes}</span>
              <button
                onClick={() => {
                  // Handle comment vote
                }}
                className="text-sm hover:text-primary-600"
              >
                ▼
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {comment.user?.display_name || comment.user?.username || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{comment.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Post not found</div>
      </div>
    )
  }

  const handleReport = async () => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    
    if (!reportReason) {
      alert('Please select a reason for reporting');
      return;
    }
    
    setLoadingReport(true);
    try {
      await api.post('/reports', {
        report_type: 'post',
        item_id: id,
        reason: reportReason,
        description: reportDescription
      });
      
      alert('Post reported successfully. Our moderators will review this content.');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Failed to report post:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Post */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote('upvote')}
              className={`text-2xl hover:text-primary-600 ${
                userVote === 'upvote' ? 'text-primary-600' : ''
              }`}
            >
              ▲
            </button>
            <span className="text-lg font-medium">{post.upvotes - post.downvotes}</span>
            <button
              onClick={() => handleVote('downvote')}
              className={`text-2xl hover:text-primary-600 ${
                userVote === 'downvote' ? 'text-primary-600' : ''
              }`}
            >
              ▼
            </button>
          </div>
          <div className="flex-1">
            {post.community && (
              <Link
                to={`/communities/${post.community.name}`}
                className="text-sm text-primary-600 hover:underline mb-2 block"
              >
                r/{post.community.name}
              </Link>
            )}
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>Posted by {post.user?.display_name || post.user?.username || 'Unknown'}</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <button
                onClick={toggleBookmark}
                disabled={loadingBookmark}
                className={`flex items-center gap-1 ${
                  isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                {isBookmarked ? '★' : '☆'}
                <span className="text-xs">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>
            <div className="max-w-none">
              {post.post_type === 'text' ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
              ) : post.post_type === 'code' ? (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  <code className="text-sm">{post.content}</code>
                </pre>
              ) : post.post_type === 'link' ? (
                <div className="p-4 bg-gray-50 rounded">
                  <p className="mb-2">Link:</p>
                  <a 
                    href={post.content} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {post.content}
                  </a>
                </div>
              ) : post.post_type === 'image' ? (
                <div className="flex justify-center mt-4">
                  <img 
                    src={post.content} 
                    alt="Post content" 
                    className="max-w-full h-auto rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // prevents looping
                      target.src = '/placeholder-image.png'; // fallback image
                    }}
                  />
                </div>
              ) : post.post_type === 'circuit' ? (
                <div className="p-4 bg-gray-100 rounded">
                  <p className="font-medium mb-2">Quantum Circuit:</p>
                  <pre className="text-sm overflow-x-auto">
                    <code>{post.content}</code>
                  </pre>
                </div>
              ) : (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  <code>{post.content}</code>
                </pre>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={toggleBookmark}
                disabled={loadingBookmark}
                className={`flex items-center gap-1 ${
                  isBookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                {isBookmarked ? '★' : '☆'}
                <span className="text-xs">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="text-gray-400 hover:text-red-500 flex items-center gap-1"
              >
                <span>🚨</span>
                <span className="text-xs">Report</span>
              </button>
            </div>
                    
            {/* Reactions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {(['👍', '❤️', '🚀', '💡', '🤔'] as const).map((reaction) => {
                  const count = getReactionCount(reaction)
                  const isActive = userReactions[reaction]
                  return (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(reaction)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
                        isActive
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{reaction}</span>
                      {count > 0 && <span className="font-medium">{count}</span>}
                    </button>
                  )
                })}
                {wsConnected && (
                  <span className="text-xs text-green-600 ml-2">● Live</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      {userProfile && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add a comment</h2>
          <form onSubmit={handleComment}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Comment
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>
        {comments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Report Post</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for reporting</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional details (optional)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Provide more details about your report"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDescription('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={loadingReport}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loadingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

