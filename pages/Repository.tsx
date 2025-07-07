import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiGitBranch, FiUpload, FiStar, FiGitCommit } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { Bell, User} from 'lucide-react';
import { FiUser, FiSettings, FiCreditCard, FiLogOut } from 'react-icons/fi';
import { logoutUser } from '@/utils/firebase';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';

interface Algorithm {
  _id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  stars: number;
  lastUpdated: string;
  language: string;
  complexity: string;
  tags: string[];
}

export default function Repository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [circuitName, setCircuitName] = useState('');
  const [circuitDescription, setCircuitDescription] = useState('');
  const [numQubits, setNumQubits] = useState(1);
  const [currentUser] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Qiskit');
  const [complexity, setComplexity] = useState('O(n)');
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [qasmFile, setQasmFile] = useState<File | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  //profile menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  //notifications state
   const [notifications] = useState([
    { id: 1, text: "Someone commented on your post", time: "2m ago" },
    { id: 2, text: "Your post received 10 upvotes", time: "1h ago" },
    // Add more notifications as needed
  ]);

  const QUANTUM_LANGUAGES = ['Qiskit', 'Cirq', 'Q#', 'Pennylane', 'Braket'];
  const COMPLEXITY_OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'];
  const QUANTUM_OPERATIONS = ['h', 'x', 'y', 'z', 'cx', 'cz', 'swap', 'toffoli', 'rx', 'ry', 'rz'];

  useEffect(() => {
    fetchAlgorithms();
  }, []);

  const fetchAlgorithms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/algorithms');
      const data: Algorithm[] = await response.json();
      setAlgorithms(data);
    } catch{
      toast.error('Failed to fetch algorithms');
    } finally {
      setIsLoading(false);
    }
  };

  //logout function
    const handleLogout = async () => {
      try {
        await logoutUser();
        setIsLoggedIn(false);
        setShowProfileMenu(false);
        router.push('/');
        toast.success('Logged out successfully');
      } catch (error: any) {
        console.error('Logout error:', error);
        toast.error(error.message || 'Failed to logout');
      }
    };

  const uploadAlgorithm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedOperations.length) {
      toast.error('Please select at least one quantum operation');
      return;
    }

    try {
      let qasmCode = code;
      if (qasmFile) {
        const fileContent = await qasmFile.text();
        qasmCode = fileContent;
      }

      const formData = {
        name: circuitName,
        description: circuitDescription,
        version: '1.0.0',
        author: currentUser || 'Anonymous',
        stars: 0,
        lastUpdated: new Date().toISOString(),
        language: selectedLanguage,
        complexity: complexity,
        tags: selectedTags,
        operations: selectedOperations,
        numQubits: numQubits,
        code: qasmCode
      };

      const response = await fetch('/api/algorithms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || 'Failed to upload');
      }

      toast.success('Algorithm uploaded successfully');
      await fetchAlgorithms();
      setIsUploadModalOpen(false);

      setCircuitName('');
      setCircuitDescription('');
      setSelectedLanguage('Qiskit');
      setComplexity('O(n)');
      setSelectedOperations([]);
      setNumQubits(1);
      setSelectedTags([]);
      setCode('');
      setQasmFile(null);

    } catch (error: unknown) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to upload algorithm');
      } else {
        toast.error('Failed to upload algorithm');
      }
    }
  };

  const filteredAlgorithms = algorithms.filter((algo) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      algo.name.toLowerCase().includes(searchLower) ||
      algo.description.toLowerCase().includes(searchLower) ||
      algo.tags.some(tag => tag.toLowerCase().includes(searchLower));

    const matchesFilter =
      selectedFilter === 'all' ||
      algo.tags.some(tag => tag.toLowerCase().includes(selectedFilter));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`min-h-screen bg-black text-white transition-opacity duration-500`}>
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-40 border-b border-gray-800">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Link href="/" className="text-2xl font-bold ml-4">
                    XREPO
                  </Link>
                </div>
      
                {/* Knowledge-specific buttons */}
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  {/* Notifications Button */}
                  <div className="relative">
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div 
                        ref={notificationsRef}
                        className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700"
                      >
                        <div className="px-4 py-2 border-b border-gray-700">
                          <h3 className="font-semibold">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id}
                              className="px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                            >
                              <p className="text-sm">{notification.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="text"
                  placeholder='Search algorithms...'
                  className='bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500' />

                  {/* Profile Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                    >
                      <User size={20} />
                    </button>
                  
                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                      <div 
                        ref={profileMenuRef}
                        className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-700"
                      >
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        >
                          <FiUser className="mr-2" />
                          Go to Profile
                        </Link>
                        <Link 
                          href="/subscription" 
                          className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        >
                          <FiCreditCard className="mr-2" />
                          My Subscription
                        </Link>
                        <Link 
                          href="/settings" 
                          className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        >
                          <FiSettings className="mr-2" />
                          Settings and Privacy
                        </Link>
                        <div className="border-t border-gray-700 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        >
                          <FiLogOut className="mr-2" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </nav>

      <Sidebar isOpen={true} setIsOpen={() => {}} />
      <div className="ml-72">
        <div className="max-w-full sm:max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:justify-end">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FiUpload /> Upload Algorithm
          </button>
        </div>

        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-gray-800/95 backdrop-blur rounded-xl shadow-xl w-full max-w-lg sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
                  <h2 className="text-xl sm:text-2xl font-semibold flex items-center">
                    <FiUpload className="mr-2" /> Upload Quantum Algorithm
                  </h2>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={uploadAlgorithm} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Algorithm Name *"
                      className="bg-gray-700 rounded-lg px-3 sm:px-4 py-2"
                      value={circuitName}
                      onChange={(e) => setCircuitName(e.target.value)}
                      required
                    />
                    <select
                      className="bg-gray-700 rounded-lg px-3 sm:px-4 py-2"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      required
                    >
                      {QUANTUM_LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    placeholder="Algorithm Description *"
                    className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-2 h-24 sm:h-32"
                    value={circuitDescription}
                    onChange={(e) => setCircuitDescription(e.target.value)}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      className="bg-gray-700 rounded-lg px-3 sm:px-4 py-2"
                      value={complexity}
                      onChange={(e) => setComplexity(e.target.value)}
                      required
                    >
                      <option value="">Select Complexity *</option>
                      {COMPLEXITY_OPTIONS.map(comp => (
                        <option key={comp} value={comp}>{comp}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Number of Qubits *"
                      className="bg-gray-700 rounded-lg px-3 sm:px-4 py-2"
                      value={numQubits}
                      onChange={(e) => setNumQubits(parseInt(e.target.value))}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-300">Quantum Operations *</label>
                    <div className="flex flex-wrap gap-2">
                      {QUANTUM_OPERATIONS.map(op => (
                        <button
                          key={op}
                          type="button"
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedOperations.includes(op)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                          onClick={() => {
                            setSelectedOperations(prev =>
                              prev.includes(op)
                                ? prev.filter(item => item !== op)
                                : [...prev, op]
                            );
                          }}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Tags (comma-separated) *"
                      className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-2"
                      value={selectedTags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                        setSelectedTags(tags);
                      }}
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Example: optimization, machine-learning, simulation</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm text-gray-300">Upload QASM File (Optional)</label>
                    <input
                      type="file"
                      accept=".qasm"
                      onChange={(e) => setQasmFile(e.target.files?.[0] || null)}
                      className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-400">Upload a .qasm file or paste your code below</p>
                  </div>

                  <textarea
                    placeholder="Paste QASM code here (optional)"
                    className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-2 h-28 sm:h-40 text-sm text-white"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="w-full sm:w-1/2 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-1/2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <FiUpload /> Upload Algorithm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-full sm:max-w-6xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search algorithms..."
              className="flex-1 bg-gray-800 rounded-lg px-3 sm:px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="bg-gray-800 rounded-lg px-3 sm:px-4 py-2 border border-gray-700"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Algorithms</option>
              <option value="optimization">Optimization</option>
              <option value="simulation">Simulation</option>
              <option value="ml">Machine Learning</option>
            </select>
          </div>
        </div>

        <div className="max-w-full sm:max-w-6xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">Available Algorithms</h2>
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="space-y-4">
              {filteredAlgorithms.map((algo) => (
                <AlgorithmItem key={algo._id} algorithm={algo} />
              ))}
            </div>
          )}
        </div>

        </div>
    </div>
  );
}

function AlgorithmItem({ algorithm }: { algorithm: Algorithm }) {
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl shadow-xl hover:shadow-2xl transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{algorithm.name}</h3>
          <p className="text-gray-400 mb-3">
            {truncateDescription(algorithm.description)}
          </p>
          <div className="flex gap-2 flex-wrap">
            {algorithm.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-400 hover:text-white">
            <FiStar /> {algorithm.stars}
          </button>
          <Link href={`/algorithm/${algorithm._id}`} className="inline-block">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              View
            </button>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-400">
        <span className="flex items-center gap-1">
          <FiGitBranch /> Version {algorithm.version}
        </span>
        <span className="flex items-center gap-1">
          <FiGitCommit /> Last updated: {algorithm.lastUpdated}
        </span>
        <span>By {algorithm.author}</span>
        <span>Complexity: {algorithm.complexity}</span>
      </div>
    </div>
  );
}
