import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to X-Repo
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              The quantum collaborative platform where enthusiasts, researchers, and students
              share projects, simulate circuits, and build knowledge-sharing communities.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Get Started
              </Link>
              <Link
                to="/playground"
                className="px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-600 transition"
              >
                Try Playground
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Quantum Project Repository</h3>
              <p className="text-gray-600">
                Upload, share, and discover quantum computing projects. Support for QASM, Qiskit, and Jupyter notebooks.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">AI-Integrated Circuit Playground</h3>
              <p className="text-gray-600">
                Design, simulate, and optimize quantum circuits with AI assistance. Real-time visualization and debugging.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Knowledge-Sharing Communities</h3>
              <p className="text-gray-600">
                Join communities, share insights, and engage in real-time discussions about quantum computing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-gray-600">Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-gray-600">Communities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">0</div>
              <div className="text-gray-600">Circuits Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-gray-600">
                Sign up with email, Google, or GitHub to start your quantum computing journey.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Build & Simulate</h3>
              <p className="text-gray-600">
                Use our AI-powered circuit playground to design, simulate, and optimize quantum circuits.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Share & Learn</h3>
              <p className="text-gray-600">
                Upload projects, join communities, and collaborate with fellow quantum enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

