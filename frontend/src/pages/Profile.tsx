import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import type { User, Project, Post } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const { userProfile: currentUserProfile } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [reputation, setReputation] = useState({
    post_karma: 0,
    comment_karma: 0,
    total_karma: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'posts'>('projects')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, projectsRes, postsRes, reputationRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/projects`),
          api.get(`/users/${username}/posts`),
          api.get(`/users/${username}/reputation`).catch(() => ({ data: { post_karma: 0, comment_karma: 0, total_karma: 0 } }))
        ])
        setUser(userRes.data)
        setProjects(projectsRes.data.projects || [])
        setPosts(postsRes.data.posts || [])
        setReputation(reputationRes.data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">User not found</div>
      </div>
    )
  }

  const isOwnProfile = currentUserProfile?.username === username

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full bg-primary-200 flex items-center justify-center text-3xl font-bold text-primary-600">
            {user.display_name?.[0] || user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.display_name || user.username}</h1>
            <p className="text-gray-600 mb-2">@{user.username}</p>
            {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {user.location && <span>📍 {user.location}</span>}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  🔗 Website
                </a>
              )}
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            {user.quantum_interests && user.quantum_interests.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {user.quantum_interests.map((interest, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{projects.length}</div>
          <div className="text-sm text-gray-600">Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">
            {projects.reduce((sum, p) => sum + p.star_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Stars Received</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{posts.length}</div>
          <div className="text-sm text-gray-600">Posts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">
            {reputation.total_karma}
          </div>
          <div className="text-sm text-gray-600">Total Karma</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'projects'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'posts'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts ({posts.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                        {project.description && (
                          <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 text-right text-sm text-gray-600">
                        <div>⭐ {project.star_count}</div>
                        <div>🍴 {project.fork_count}</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No posts yet</p>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>👍 {post.upvotes}</span>
                      <span>👎 {post.downvotes}</span>
                      <span>💬 {post.comment_count}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
