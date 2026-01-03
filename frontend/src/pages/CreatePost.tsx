import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import type { Community } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function CreatePost() {
  const { name } = useParams<{ name: string }>()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [community, setCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'text' as 'text' | 'code' | 'link' | 'image' | 'circuit',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (name) {
      fetchCommunity()
    }
  }, [name])

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/communities/${name}`)
      setCommunity(response.data)
    } catch (error) {
      console.error('Failed to fetch community:', error)
      setError('Failed to load community')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile) {
      navigate('/login')
      return
    }

    if (!community) {
      setError('Community not found')
      return
    }

    // Validate content based on post type
    if (formData.post_type === 'link') {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.content)) {
        setError('Please enter a valid URL for link posts');
        return;
      }
    } else if (formData.post_type === 'image') {
      const imagePattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/.*\.(jpg|jpeg|png|gif|bmp|webp)$/i;
      if (!imagePattern.test(formData.content)) {
        setError('Please enter a valid image URL (jpg, jpeg, png, gif, bmp, or webp)');
        return;
      }
    } else if (formData.post_type === 'text' && !formData.content.trim()) {
      setError('Content is required for text posts');
      return;
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/posts', {
        ...formData,
        community_id: community.id,
      })
      
      // Navigate to the newly created post
      navigate(`/posts/${response.data.id}`)
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.detail || 'Failed to create post')
      setLoading(false)
    }
  }



  if (!community) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/communities/${community.name}`}
          className="text-primary-600 hover:underline flex items-center gap-2"
        >
          <span>←</span>
          <span>Back to r/{community.name}</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Create Post in r/{community.name}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {(['text', 'code', 'link', 'image', 'circuit'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, post_type: type })}
                className={`px-4 py-3 rounded-lg border text-center transition ${
                  formData.post_type === type
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium capitalize">{type}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Post title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.post_type === 'text' ? 'Content' : 
             formData.post_type === 'code' ? 'Code' : 
             formData.post_type === 'link' ? 'URL' : 
             formData.post_type === 'image' ? 'Image URL' : 
             'Circuit Content'}
          </label>
          {formData.post_type === 'text' ? (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={6}
              placeholder="Write your post content here..."
            />
          ) : formData.post_type === 'code' ? (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              rows={10}
              placeholder="Paste your code here..."
            />
          ) : (
            <input
              type="text"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={
                formData.post_type === 'link' ? 'https://example.com' :
                formData.post_type === 'image' ? 'https://example.com/image.jpg' :
                'Circuit data or QASM code'
              }
            />
          )}
        </div>



        <div className="flex justify-end gap-4">
          <Link
            to={`/communities/${community.name}`}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  )
}