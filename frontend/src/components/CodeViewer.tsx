import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface CodeViewerProps {
  content: string
  language?: string
  fileName: string
  fileUrl?: string
}

export default function CodeViewer({ content, language, fileName, fileUrl }: CodeViewerProps) {
  // Detect language from file extension
  const ext = fileName.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    qasm: 'qasm',
    py: 'python',
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    md: 'markdown',
    html: 'html',
    css: 'css',
    yml: 'yaml',
    yaml: 'yaml',
    sh: 'bash',
    bash: 'bash',
  }
  const detectedLang = language || langMap[ext || ''] || 'plaintext'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    // Could add a toast notification here
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{fileName}</span>
        <div className="flex items-center gap-2">
          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Raw
            </a>
          )}
          <button
            onClick={copyToClipboard}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Copy
          </button>
          <button
            onClick={() => {
              const blob = new Blob([content], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = fileName
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Download
          </button>
        </div>
      </div>
      <div className="overflow-auto max-h-[600px]">
        <SyntaxHighlighter
          language={detectedLang}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '14px',
          }}
          showLineNumbers
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

