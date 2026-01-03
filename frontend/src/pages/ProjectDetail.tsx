import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Project, ProjectFile, User } from '../types'
import { useAuth } from '../contexts/AuthContext'
import ReactMarkdown from 'react-markdown'
import FileTree from '../components/FileTree'
import CodeViewer from '../components/CodeViewer'
import ProjectHeader from '../components/ProjectHeader'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [starred, setStarred] = useState(false)

  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [loadingFile, setLoadingFile] = useState(false)
  const [activeTab, setActiveTab] = useState<'readme' | 'files' | 'contributors' | 'activity'>('readme')
  const [contributors, setContributors] = useState<User[]>([])

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`)
      setProject(response.data)
      setFiles(response.data.files || [])
      // Set README as default selected file if available
      const readmeFile = response.data.files?.find((f: ProjectFile) =>
        f.file_name.toLowerCase() === 'readme.md' || f.file_name.toLowerCase().endsWith('/readme.md')
      )
      if (readmeFile) {
        setSelectedFile(readmeFile)
        fetchFileContent(readmeFile)
      }
      // Fetch contributors (would need backend endpoint)
      fetchContributors()
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFileContent = async (file: ProjectFile) => {
    setLoadingFile(true)
    try {
      const response = await fetch(file.file_path)
      const text = await response.text()
      setFileContent(text)
      setSelectedFile(file)
    } catch (error) {
      console.error('Failed to fetch file content:', error)
      setFileContent('Unable to load file content')
    } finally {
      setLoadingFile(false)
    }
  }

  const fetchContributors = async () => {
    // This would need a backend endpoint
    // For now, just show the project owner
    if (project?.user) {
      setContributors([project.user])
    }
  }

  const handleStar = async () => {
    if (!userProfile) {
      navigate('/login')
      return
    }
    try {
      const response = await api.post(`/projects/${id}/star`)
      setStarred(response.data.starred)
      if (project) {
        setProject({
          ...project,
          star_count: response.data.starred ? project.star_count + 1 : project.star_count - 1,
        })
      }
    } catch (error) {
      console.error('Failed to star project:', error)
    }
  }

  const handleFork = async () => {
    if (!userProfile) {
      navigate('/login')
      return
    }
    try {
      await api.post(`/projects/${id}/fork`)

      if (project) {
        setProject({
          ...project,
          fork_count: project.fork_count + 1,
        })
      }
      alert('Project forked successfully!')
    } catch (error: any) {
      console.error('Failed to fork project:', error)
      alert(error.response?.data?.detail || 'Failed to fork project')
    }
  }

  const downloadProject = async () => {
    try {
      const response = await api.get(`/projects/${id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${project?.title || 'project'}.zip`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to download project:', error)
      alert('Failed to download project')
    }
  }

  const isCodeFile = (fileName: string) => {
    const codeExts = ['.qasm', '.py', '.js', '.ts', '.json', '.md', '.html', '.css', '.yaml', '.yml']
    return codeExts.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  const isImageFile = (fileName: string) => {
    const imageExts = ['.png', '.jpg', '.jpeg', '.svg', '.gif']
    return imageExts.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Project not found</div>
      </div>
    )
  }

  const isOwner = userProfile?.id === project.user_id

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProjectHeader
        project={{ ...project, files }}
        starred={starred}
        onStar={handleStar}
        onFork={handleFork}
        onDownload={downloadProject}
        isOwner={isOwner}
        projectId={id!}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FileTree
            files={files}
            onFileSelect={fetchFileContent}
            selectedFileId={selectedFile?.id}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border-b border-gray-200">
            <nav className="flex -mb-px">
              {(['readme', 'files', 'contributors', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium ${activeTab === tab
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'readme' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {project.readme_content ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{project.readme_content}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  No README available. Add one in the project settings.
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              {selectedFile ? (
                <>
                  {loadingFile ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">Loading file...</div>
                  ) : isImageFile(selectedFile.file_name) ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <img src={selectedFile.file_path} alt={selectedFile.file_name} className="max-w-full" />
                    </div>
                  ) : isCodeFile(selectedFile.file_name) ? (
                    <CodeViewer
                      content={fileContent}
                      fileName={selectedFile.file_name}
                      fileUrl={selectedFile.file_path}
                    />
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 mb-4">
                        <span className="text-sm font-medium">{selectedFile.file_name}</span>
                      </div>
                      <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
                        <code>{fileContent}</code>
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                  Select a file from the tree to view its contents
                </div>
              )}
            </div>
          )}

          {activeTab === 'contributors' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Contributors</h2>
              {contributors.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No contributors yet</div>
              ) : (
                <div className="space-y-3">
                  {contributors.map((contributor) => (
                    <Link
                      key={contributor.id}
                      to={`/profile/${contributor.username}`}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-bold">
                        {contributor.display_name?.[0] || contributor.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{contributor.display_name || contributor.username}</div>
                        <div className="text-sm text-gray-600">@{contributor.username}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Project created</span>
                  <span className="ml-2">{new Date(project.created_at).toLocaleString()}</span>
                </div>
                {project.updated_at !== project.created_at && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Last updated</span>
                    <span className="ml-2">{new Date(project.updated_at).toLocaleString()}</span>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{files.length} files added</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
