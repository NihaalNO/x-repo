import { Link } from 'react-router-dom'
import type { Project } from '../types'

interface ProjectHeaderProps {
  project: Project
  starred: boolean
  onStar: () => void
  onFork: () => void
  onDownload: () => void
  isOwner: boolean
  projectId: string
}

export default function ProjectHeader({
  project,
  starred,
  onStar,
  onFork,
  onDownload,
  isOwner,
  projectId,
}: ProjectHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-4">
        <Link to="/projects" className="hover:text-primary-600">
          Projects
        </Link>
        <span className="mx-2">/</span>
        {project.user && (
          <>
            <Link
              to={`/profile/${project.user.username}`}
              className="hover:text-primary-600"
            >
              {project.user.display_name || project.user.username}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{project.title}</span>
      </nav>

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          {project.description && (
            <p className="text-gray-700 mb-4">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onStar}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${starred
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <span>⭐</span>
            <span>Star</span>
            <span className="bg-black/10 px-2 py-0.5 rounded text-sm">{project.star_count}</span>
          </button>
          <button
            onClick={onFork}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          >
            <span>🍴</span>
            <span>Fork</span>
            <span className="bg-black/10 px-2 py-0.5 rounded text-sm">{project.fork_count}</span>
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
              <span>📥</span>
              <span>Code</span>
              <span>▼</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
              <button
                onClick={onDownload}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg text-sm"
              >
                Download ZIP
              </button>
              <a
                href={`/api/projects/${projectId}/clone`}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg text-sm"
              >
                Clone URL
              </a>
            </div>
          </div>
          {isOwner && (
            <Link
              to={`/projects/${projectId}/edit`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map((tag, idx) => (
          <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span className={`px-2 py-1 rounded ${project.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {project.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
        </span>
        <span>⭐ {project.star_count} stars</span>
        <span>🍴 {project.fork_count} forks</span>
        <span>📁 {project.files?.length || 0} files</span>
        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
        <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

