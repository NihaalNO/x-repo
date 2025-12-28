import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Community, Post } from '../types'
import { useAuth } from '../contexts/AuthContext'
import ReactMarkdown from 'react-markdown'

export default function CommunityDetail() {
  const { name } = useParams<{ name: string }>()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState<Community | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [sort, setSort] = useState<'hot' | 'new' | 'top' | 'controversial'>('hot')
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (name) {
      fetchCommunity()
      fetchPosts()
    }
  }, [name, sort, timeRange])
  
  useEffect(() => {
    if (name && searchQuery) {
      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      // Set a new timeout to fetch posts after user stops typing
      const timeout = setTimeout(() => {
        fetchPosts();
      }, 500);
      
      setSearchTimeout(timeout);
    } else if (name && !searchQuery) {
      // If search query is empty, fetch posts immediately
      fetchPosts();
    }
    
    // Cleanup function to clear timeout when component unmounts or dependencies change
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [name, searchQuery])

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${name}`)
      setCommunity(response.data)
      // Check if user has joined (would need separate endpoint)
    } catch (error) {
      console.error('Failed to fetch community:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      let url = `/communities/${name}/posts?sort=${sort}&time_range=${timeRange}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const response = await api.get(url);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleJoin = async () => {
    if (!userProfile) {
      navigate('/login')
      return
    }
    try {
      if (joined) {
        await api.post(`/communities/${name}/leave`)
      } else {
        await api.post(`/communities/${name}/join`)
      }
      setJoined(!joined)
      if (community) {
        setCommunity({
          ...community,
          member_count: joined ? community.member_count - 1 : community.member_count + 1,
        })
      }
    } catch (error) {
      console.error('Failed to join/leave community:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Community not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Community Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">r/{community.name}</h1>
            <p className="text-xl text-gray-700 mb-2">{community.display_name}</p>
            {community.description && (
              <p className="text-gray-600 mb-4">{community.description}</p>
            )}
          </div>
          <button
            onClick={handleJoin}
            className={`px-6 py-2 rounded-lg transition ${
              joined
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {joined ? 'Leave' : 'Join'} Community
          </button>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span>👥 {community.member_count} members</span>
          <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
        </div>
        {community.rules && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Community Rules</h3>
            <div className="prose prose-sm">
              <ReactMarkdown>{community.rules}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Sort Options */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          {(['hot', 'new', 'top', 'controversial'] as const).map((sortOption) => (
            <button
              key={sortOption}
              onClick={() => setSort(sortOption)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                sort === sortOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
            </button>
          ))}
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Time:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchTimeout) {
                  clearTimeout(searchTimeout);
                }
                const timeout = setTimeout(() => {
                  // fetchPosts will be called automatically due to useEffect dependency
                }, 500);
                setSearchTimeout(timeout);
              }}
              className="flex-grow px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  if (searchTimeout) {
                    clearTimeout(searchTimeout);
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          
          {userProfile && (
            <Link
              to={`/communities/${name}/submit`}
              className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Post
            </Link>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            No posts yet. Be the first to post!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      // Handle upvote
                    }}
                    className="text-2xl hover:text-primary-600"
                  >
                    ▲
                  </button>
                  <span className="text-lg font-medium">{post.upvotes - post.downvotes}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      // Handle downvote
                    }}
                    className="text-2xl hover:text-primary-600"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1">
                  <Link to={`/posts/${post.id}`} className="block">
                    <h3 className="text-xl font-semibold mb-2 hover:underline">{post.title}</h3>
                    {post.post_type === 'text' && (
                      <p className="text-gray-600 mb-3 line-clamp-3">{post.content}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Posted by {post.user?.display_name || post.user?.username || 'Unknown'}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      <span>💬 {post.comment_count} comments</span>
                      <span>👍 {post.upvotes} upvotes</span>
                    </div>
                  </Link>
                  
                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    {(['👍', '❤️', '🚀', '💡', '🤔'] as const).map((reaction) => {
                      // This would need to be updated with actual reaction counts
                      return (
                        <button
                          key={reaction}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <span>{reaction}</span>
                          <span className="font-medium">0</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
