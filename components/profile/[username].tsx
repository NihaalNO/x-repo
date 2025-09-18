// pages/profile/[username].tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'  // Update path as needed
import type { Algorithm, UserProfile } from '../../types/supabase'
import Link from 'next/link'
import { FiGitBranch, FiGitCommit, FiStar } from 'react-icons/fi'

export default function UserProfilePage() {
  const router = useRouter()
  const { username } = router.query

  const [user, setUser] = useState<UserProfile | null>(null)
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username || typeof username !== 'string') return

    const fetchUserAndAlgorithms = async () => {
      setLoading(true)
      setError(null)

      try {
        // 1. Fetch user profile by username
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single()

        if (userError || !users) {
          setError('User not found')
          setUser(null)
          setAlgorithms([])
          setLoading(false)
          return
        }

        setUser(users as UserProfile)

        // 2. Fetch public algorithms owned by this user
        const { data: algos, error: algoError } = await supabase
          .from('algorithms')
          .select('*')
          .eq('user_id', users.id)
          .eq('public', true)
          .order('lastUpdated', { ascending: false })

        if (algoError) {
          setError('Failed to load algorithms')
          setAlgorithms([])
          setLoading(false)
          return
        }

        setAlgorithms(algos ?? [])
      } catch (e) {
        setError('Unexpected error occurred')
        setUser(null)
        setAlgorithms([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndAlgorithms()
  }, [username])

  if (loading) return <div className="text-center mt-10">Loading...</div>
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>
  if (!user) return <div className="text-center mt-10">No user found.</div>

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-white bg-black min-h-screen">
      <div className="flex items-center gap-6 mb-8">
        <img
          src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`}
          alt={`${user.display_name}'s avatar`}
          className="rounded-full w-24 h-24 border-2 border-blue-500"
        />
        <div>
          <h1 className="text-4xl font-bold">{user.display_name}</h1>
          <p className="text-blue-400 text-lg">@{user.username}</p>
          {user.bio && <p className="mt-2 text-gray-400 max-w-xl">{user.bio}</p>}
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Algorithms by {user.display_name}</h2>
        {algorithms.length === 0 ? (
          <p className="text-gray-500">This user has no public algorithms yet.</p>
        ) : (
          <div className="space-y-6">
            {algorithms.map((algo) => (
              <AlgorithmCard key={algo.id} algorithm={algo} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

// --- Algorithm Card component ---
function AlgorithmCard({ algorithm }: { algorithm: Algorithm }) {
  // Helper to truncate long descriptions
  const truncate = (text: string, maxLength = 120) => {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
  }

  // tags stored as comma separated string
  const tags = algorithm.tags ? algorithm.tags.split(',').map(t => t.trim()) : []

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition">
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{algorithm.name}</h3>
          <p className="text-gray-400 mt-1">{truncate(algorithm.description)}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-gray-400 text-sm mt-4 sm:mt-0 flex flex-col sm:items-end gap-1">
          <span className="flex items-center gap-1">
            <FiGitBranch /> Version {algorithm.version}
          </span>
          <span className="flex items-center gap-1">
            <FiGitCommit /> Last updated: {algorithm.lastUpdated.split('T')[0]}
          </span>
          <span>Complexity: {algorithm.complexity}</span>
          <span className="flex items-center gap-1">
            <FiStar className="text-yellow-400" /> {algorithm.stars}
          </span>
        </div>
      </div>
      <div className="text-right">
        <Link href={`/algorithm/${algorithm.id}`}>
          <a className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
            View Algorithm
          </a>
        </Link>
      </div>
    </div>
  )
}
// --- End of Algorithm Card component ---