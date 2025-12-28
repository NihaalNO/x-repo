import { useState } from 'react'
import type { ProjectFile } from '../types'

interface FileTreeProps {
  files: ProjectFile[]
  onFileSelect: (file: ProjectFile) => void
  selectedFileId?: string
}

interface TreeNode {
  name: string
  path: string
  file?: ProjectFile
  children: Map<string, TreeNode>
}

function buildTree(files: ProjectFile[]): TreeNode {
  const root: TreeNode = { name: '', path: '', children: new Map() }

  files.forEach((file) => {
    const parts = file.file_name.split('/')
    let current = root

    parts.forEach((part, index) => {
      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          path: parts.slice(0, index + 1).join('/'),
          children: new Map(),
        })
      }
      current = current.children.get(part)!

      if (index === parts.length - 1) {
        current.file = file
      }
    })
  })

  return root
}

function FileIcon({ fileName }: { fileName: string }) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    qasm: '⚛️',
    py: '🐍',
    ipynb: '📓',
    json: '📋',
    md: '📝',
    txt: '📄',
    pdf: '📕',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    svg: '🖼️',
  }
  return <span className="mr-2">{iconMap[ext || ''] || '📁'}</span>
}

function TreeNodeComponent({
  node,
  level,
  onFileSelect,
  selectedFileId,
}: {
  node: TreeNode
  level: number
  onFileSelect: (file: ProjectFile) => void
  selectedFileId?: string
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children.size > 0
  const isSelected = node.file?.id === selectedFileId

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 rounded ${
          isSelected ? 'bg-primary-50 border-l-2 border-primary-600' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (node.file) {
            onFileSelect(node.file)
          } else if (hasChildren) {
            setExpanded(!expanded)
          }
        }}
      >
        {hasChildren && (
          <span className="mr-1 w-4 text-center">
            {expanded ? '📂' : '📁'}
          </span>
        )}
        {node.file && <FileIcon fileName={node.name} />}
        <span className="text-sm font-medium">{node.name}</span>
        {node.file && (
          <span className="ml-auto text-xs text-gray-500">
            {(node.file.file_size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {Array.from(node.children.values())
            .sort((a, b) => {
              if (a.file && !b.file) return 1
              if (!a.file && b.file) return -1
              return a.name.localeCompare(b.name)
            })
            .map((child) => (
              <TreeNodeComponent
                key={child.path}
                node={child}
                level={level + 1}
                onFileSelect={onFileSelect}
                selectedFileId={selectedFileId}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default function FileTree({ files, onFileSelect, selectedFileId }: FileTreeProps) {
  const tree = buildTree(files)

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Files</h3>
      </div>
      <div className="p-2 max-h-96 overflow-y-auto">
        {files.length === 0 ? (
          <div className="text-center text-gray-500 py-4 text-sm">No files</div>
        ) : (
          Array.from(tree.children.values())
            .sort((a, b) => {
              if (a.file && !b.file) return 1
              if (!a.file && b.file) return -1
              return a.name.localeCompare(b.name)
            })
            .map((child) => (
              <TreeNodeComponent
                key={child.path}
                node={child}
                level={0}
                onFileSelect={onFileSelect}
                selectedFileId={selectedFileId}
              />
            ))
        )}
      </div>
    </div>
  )
}
