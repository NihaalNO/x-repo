import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Project } from '../types'

export default function EditProject() {
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    readme_content: '',
    visibility: 'public',
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [project, setProject] = useState<Project | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) {
      navigate('/projects')
      return
    }
    
    fetchProject()
  }, [id, navigate])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`)
      const proj = response.data
      setProject(proj)
      
      setFormData({
        title: proj.title,
        description: proj.description || '',
        readme_content: proj.readme_content || '',
        visibility: proj.visibility,
        tags: proj.tags || [],
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile || !id) {
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.patch(`/projects/${id}`, formData)
      
      // Upload files if any
      if (selectedFiles.length > 0) {
        setUploadStatus('Uploading files...')
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i]
          const formDataFile = new FormData()
          formDataFile.append('file', file)
          
          try {
            await api.post(`/projects/${id}/files`, formDataFile, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100))
          } catch (err: any) {
            console.error('Failed to upload file:', file.name, err)
            // Continue with other files
          }
        }
      }
      
      navigate(`/projects/${id}`)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update project')
      setLoading(false)
    } finally {
      setUploadProgress(null)
      setUploadStatus('')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Project not found</div>
      </div>
    )
  }

  const isOwner = userProfile?.id === project.user_id
  if (!isOwner) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">You don't have permission to edit this project</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="My Quantum Project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="A brief description of your project"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            README
          </label>
          <textarea
            value={formData.readme_content}
            onChange={(e) => setFormData({ ...formData, readme_content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            rows={10}
            placeholder="# Project Name&#10;&#10;Description of your project..."
          />
          <p className="mt-1 text-xs text-gray-500">Markdown supported</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="public">🌐 Public - Anyone can see this project</option>
            <option value="private">🔒 Private - Only you can see this project</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".qasm,.ipynb,.py"
              onChange={(e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files).filter(file => {
                    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
                    return ['.qasm', '.ipynb', '.py'].includes(ext)
                  })
                  setSelectedFiles(files)
                }
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Choose Files
            </button>
            {selectedFiles.length > 0 && (
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {selectedFiles.length} file(s) selected: 
                  {selectedFiles.map(f => f.name).join(', ')}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-600 hover:text-red-800 mt-1"
                >
                  Clear files
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Supported file types: .qasm, .ipynb, .py
          </p>
          
          {uploadProgress !== null && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">{uploadStatus}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to={`/projects/${id}`}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </div>
  )
}