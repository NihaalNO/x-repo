import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Community } from '../types'

export default function Communities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/communities')
      setCommunities(response.data.communities || [])
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Communities</h1>
        <Link
          to="/communities/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Create Community
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading communities...</div>
      ) : communities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No communities yet. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link
              key={community.id}
              to={`/communities/${community.name}`}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">r/{community.name}</h3>
              <p className="text-lg font-medium text-gray-700 mb-2">{community.display_name}</p>
              {community.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{community.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>👥 {community.member_count} members</span>
                <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
