export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">About X-Repo</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          X-Repo is an open-source quantum collaborative platform designed to democratize
          quantum computing education and collaboration.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          Create the "GitHub meets Reddit" for quantum computing, where users can experiment,
          learn, and collaborate on quantum computing projects with AI-assisted tools.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li><strong>Quantum Project Repository:</strong> Upload, share, and discover quantum computing projects with support for QASM, Qiskit, and Jupyter notebooks.</li>
          <li><strong>AI-Integrated Circuit Playground:</strong> Design, simulate, and optimize quantum circuits with real-time AI assistance for debugging and optimization.</li>
          <li><strong>Knowledge-Sharing Communities:</strong> Join topic-based communities, share insights, and engage in real-time discussions.</li>
          <li><strong>Educational Resources:</strong> Learn from tutorials, examples, and community-driven content.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Frontend</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>React 18 + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Firebase Authentication</li>
              <li>Supabase Realtime</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Backend</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>FastAPI (Python)</li>
              <li>Qiskit (Quantum Computing)</li>
              <li>Google Gemini AI</li>
              <li>Supabase (PostgreSQL)</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Open Source</h2>
        <p className="text-gray-700 mb-4">
          X-Repo is open source and available under the MIT License. We welcome contributions
          from the quantum computing community!
        </p>
        <p className="text-gray-700">
          Whether you're a student learning quantum computing, a researcher sharing your work,
          or a developer building quantum applications, X-Repo provides the tools and community
          to help you succeed.
        </p>
      </div>
    </div>
  )
}

