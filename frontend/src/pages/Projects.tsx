import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Project } from '../types'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    fetchProjects()
  }, [search, selectedTags])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
      
      const response = await api.get(`/projects?${params.toString()}`)
      setProjects(response.data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags)))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quantum Projects</h1>
        <Link
          to="/projects/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          New Project
        </Link>
      </div>
      <div className="mb-6">
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                  )
                }}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No projects found. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{project.title}</h3>
              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>⭐ {project.star_count}</span>
                  <span>🍴 {project.fork_count}</span>
                </div>
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              {project.user && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">By {project.user.display_name || project.user.username}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
