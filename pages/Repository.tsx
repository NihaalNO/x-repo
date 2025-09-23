"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiStar, FiCode, FiPlus, FiUpload, FiX, FiUser, FiEdit3, FiTrash2, FiEye, FiGitBranch, FiCalendar, FiExternalLink, FiChevronUp, FiChevronDown } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabaseClient";
import { auth } from "../utils/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

// ---------- REPOSITORY TYPES ---------- //
interface Repository {
  id: string;
  created_at: string;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  owner_id: string;
  tags?: string;
  code?: string;
  public?: boolean;
  complexity?: string;
  version?: string;
}

interface NewRepository {
  name: string;
  description: string;
  language: string;
  code?: string;
  tags?: string[];
  complexity?: string;
  public?: boolean;
}

// Helper function to handle Supabase authentication for repository operations
const getAuthenticatedSupabaseClient = async (firebaseUser: User) => {
  try {
    // For development: Use service role key or disable RLS temporarily
    // This is a temporary solution - in production, implement proper auth integration
    
    // Method 1: Try to authenticate with Supabase using Firebase email
    if (firebaseUser.email) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Sign in anonymously as a fallback for development
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous auth error:', error);
          return { client: supabase, userId: null, error };
        }
        return { client: supabase, userId: data.user?.id || null, error: null };
      }
      
      return { client: supabase, userId: user.id, error: null };
    }
    
    return { client: supabase, userId: null, error: new Error('No email available') };
    
  } catch (error) {
    console.error('Auth setup error:', error);
    return { client: supabase, userId: null, error };
  }
};

// ---------- MAIN COMPONENT ---------- //
export default function RepositoryPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [userRepositories, setUserRepositories] = useState<Repository[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'yours'>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const repositoriesListRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [newRepo, setNewRepo] = useState<NewRepository>({
    name: "",
    description: "",
    language: "Python"
  });

  // Handle scroll events for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll functions
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToRepositories = () => {
    if (repositoriesListRef.current) {
      repositoriesListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToRepository = (index: number) => {
    const repositoryElement = document.querySelector(`[data-repo-index="${index}"]`);
    if (repositoryElement) {
      repositoryElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      
      // Get or ensure Supabase authentication
      if (user) {
        const authResult = await getAuthenticatedSupabaseClient(user);
        setSupabaseUserId(authResult.userId);
      } else {
        setSupabaseUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch repositories
  useEffect(() => {
    const fetchRepositories = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("repositories")
        .select("*")
        .order("stargazers_count", { ascending: false });

      if (error) {
        console.error("Error fetching repositories:", error);
      } else {
        setRepositories(data);
        setFilteredRepositories(data);
        // Filter user repositories
        if (currentUser && supabaseUserId) {
          const userRepos = data.filter(repo => repo.owner_id === supabaseUserId);
          setUserRepositories(userRepos);
        }
      }
      setIsLoading(false);
    };
    fetchRepositories();
  }, [currentUser, supabaseUserId]);

  // Filter repositories based on search term and active tab
  useEffect(() => {
    const reposToFilter = activeTab === 'all' ? repositories : userRepositories;
    
    if (searchTerm.trim() === "") {
      setFilteredRepositories(reposToFilter);
    } else {
      const filtered = reposToFilter.filter((repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.tags && repo.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRepositories(filtered);
      
      // Smooth scroll to repositories list when search results change
      if (searchTerm.trim() !== "" && filtered.length > 0) {
        setTimeout(() => scrollToRepositories(), 100);
      }
    }
  }, [searchTerm, repositories, userRepositories, activeTab]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle upload modal
  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setNewRepo({
      name: "",
      description: "",
      language: "Python"
    });
  };

  // Handle form submission
  const handleSubmitRepository = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert("Please sign in to create repositories.");
      return;
    }

    setIsUploading(true);

    try {
      // Get authenticated Supabase client
      const authResult = await getAuthenticatedSupabaseClient(currentUser);
      
      if (!authResult.userId) {
        alert("Authentication required. Please ensure you're signed in.");
        setIsUploading(false);
        return;
      }

      // The RLS policy will check if auth.uid() = owner_id
      // Make sure we don't include 'id' field as it should be auto-generated
      const insertData = {
        name: newRepo.name.trim(), // Trim whitespace
        description: newRepo.description.trim(),
        language: newRepo.language,
        owner_id: authResult.userId, // This must match auth.uid() for RLS policy
        stargazers_count: 0,
        forks_count: 0
      };
      
      console.log('Inserting repository with data:', insertData);
      
      // First check if a repository with this name already exists for this user
      const { data: existingRepos, error: checkError } = await authResult.client
        .from("repositories")
        .select("name")
        .eq("owner_id", authResult.userId)
        .eq("name", insertData.name);
        
      if (checkError) {
        console.error("Error checking existing repositories:", checkError);
      } else if (existingRepos && existingRepos.length > 0) {
        alert("A repository with this name already exists. Please choose a different name.");
        setIsUploading(false);
        return;
      }
      
      // Retry logic for handling potential sequence issues
      let insertAttempts = 0;
      const maxAttempts = 3;
      let insertResult = null;
      let insertError = null;
      
      while (insertAttempts < maxAttempts && !insertResult) {
        insertAttempts++;
        console.log(`Insert attempt ${insertAttempts}`);
        
        const { data, error } = await authResult.client
          .from("repositories")
          .insert([insertData])
          .select();
          
        if (!error) {
          insertResult = data;
          break;
        } else {
          insertError = error;
          console.error(`Insert attempt ${insertAttempts} failed:`, error);
          
          // If it's a primary key violation and not the last attempt, wait and retry
          if (error.code === '23505' && insertAttempts < maxAttempts) {
            console.log(`Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            break;
          }
        }
      }

      if (insertError) {
        console.error("Error uploading repository:", insertError);
        console.error("Full error details:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        
        // Provide more specific error messages
        if (insertError.code === '23505') {
          alert("This repository name might already exist or there's a duplicate key issue. Please try a different name or contact support.");
        } else {
          alert(`Failed to upload repository: ${insertError.message}. Please try again.`);
        }
      } else {
        // Add new repository to local state
        if (insertResult && insertResult[0]) {
          const newRepository = insertResult[0];
          setRepositories(prev => [newRepository, ...prev]);
          setUserRepositories(prev => [newRepository, ...prev]);
          if (activeTab === 'all') {
            setFilteredRepositories(prev => [newRepository, ...prev]);
          } else {
            setFilteredRepositories(prev => [newRepository, ...prev]);
          }
        }
        handleModalClose();
        alert("Repository created successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof NewRepository, value: string | boolean) => {
    setNewRepo(prev => ({ ...prev, [field]: value }));
  };

  // Handle repository modal
  const handleRepositoryClick = (repo: Repository) => {
    setSelectedRepository(repo);
    setIsRepoModalOpen(true);
  };

  const handleRepoModalClose = () => {
    setIsRepoModalOpen(false);
    setSelectedRepository(null);
  };

  // Handle repository deletion
  const handleDeleteRepository = async (repoId: string) => {
    if (!currentUser) {
      alert("Please sign in to delete repositories.");
      return;
    }

    if (!confirm("Are you sure you want to delete this repository?")) {
      return;
    }

    try {
      // Check if we have Supabase user ID
      if (!supabaseUserId) {
        alert("User not authenticated with Supabase. Please sign in again.");
        return;
      }

      const { error } = await supabase
        .from("repositories")
        .delete()
        .eq('id', repoId)
        .eq('owner_id', supabaseUserId); // Ensure user can only delete their own repos

      if (error) {
        console.error("Error deleting repository:", error);
        alert("Failed to delete repository. Please try again.");
      } else {
        // Remove from local state
        setRepositories(prev => prev.filter(repo => repo.id !== repoId));
        setUserRepositories(prev => prev.filter(repo => repo.id !== repoId));
        setFilteredRepositories(prev => prev.filter(repo => repo.id !== repoId));
        alert("Repository deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white" style={{ scrollBehavior: 'smooth' }}>
      <div ref={topRef}></div>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold ml-4">
              XREPO
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUploadClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Repository</span>
            </button>
          </div>
        </div>
      </nav>

      <Sidebar isOpen={true} setIsOpen={() => {}} />

      <div className="ml-72 pt-24 px-4">
        {/* Tab Navigation */}
        <div className="max-w-full sm:max-w-6xl mx-auto mb-6">
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('all');
                setTimeout(() => scrollToRepositories(), 100);
              }}
              className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiCode className="w-4 h-4" />
              <span>All Repositories</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('yours');
                setTimeout(() => scrollToRepositories(), 100);
              }}
              className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'yours'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FiUser className="w-4 h-4" />
              <span>Your Repositories ({userRepositories.length})</span>
            </button>
          </div>
        </div>

        {/* Repository List */}
        <div className="max-w-full sm:max-w-6xl mx-auto" ref={repositoriesListRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {activeTab === 'all' ? 'All Repositories' : 'Your Repositories'}
            </h2>
            {/* Smooth Scrolling Navigation */}
            {filteredRepositories.length > 5 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={scrollToTop}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Scroll to Top"
                >
                  <FiChevronUp className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400">
                  {filteredRepositories.length} repositories
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : filteredRepositories.length > 0 ? (
              filteredRepositories.map((repo, index) => (
                <div key={repo.id} data-repo-index={index} className="scroll-smooth">
                  <RepositoryItem 
                    repo={repo} 
                    isOwner={repo.owner_id === supabaseUserId}
                    onDelete={handleDeleteRepository}
                    onRepositoryClick={handleRepositoryClick}
                  />
                </div>
              ))
            ) : searchTerm ? (
              <div className="text-center text-gray-500 py-8">
                No repositories found matching "{searchTerm}" in {activeTab === 'all' ? 'all repositories' : 'your repositories'}.
              </div>
            ) : activeTab === 'yours' && userRepositories.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FiUpload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No repositories created yet</p>
                <p className="text-sm mb-4">Start by creating your first repository!</p>
                <button
                  onClick={handleUploadClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Your First Repository
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No repositories found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Scroll Controls */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-40">
          {/* Scroll to Top Button */}
          <button
            onClick={scrollToTop}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
            title="Scroll to Top"
          >
            <FiChevronUp className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <FiUpload className="w-6 h-6" />
                <span>Create New Repository</span>
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitRepository} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Repository Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRepo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Quantum Machine Learning Framework"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={newRepo.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your repository..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Programming Language *
                </label>
                <select
                  required
                  value={newRepo.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Python">Python</option>
                  <option value="Qiskit">Qiskit</option>
                  <option value="Cirq">Cirq</option>
                  <option value="Q#">Q#</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="QASM">QASM</option>
                  <option value="Julia">Julia</option>
                  <option value="MATLAB">MATLAB</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="C++">C++</option>
                  <option value="Java">Java</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-4 h-4" />
                      <span>Create Repository</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repository Details Modal */}
      {isRepoModalOpen && selectedRepository && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <FiCode className="w-6 h-6" />
                <span>{selectedRepository.name}</span>
              </h2>
              <button
                onClick={handleRepoModalClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Repository Header Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-2 text-blue-400">
                      <FiCode className="w-5 h-5" />
                      {selectedRepository.language}
                    </span>
                    <span className="flex items-center gap-2 text-yellow-400">
                      <FiStar className="w-5 h-5" />
                      {selectedRepository.stargazers_count} stars
                    </span>
                    <span className="flex items-center gap-2 text-green-400">
                      <FiGitBranch className="w-5 h-5" />
                      {selectedRepository.forks_count} forks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm">
                      Created {new Date(selectedRepository.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed">
                    {selectedRepository.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              {(selectedRepository.tags || selectedRepository.complexity) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Additional Information</h3>
                  <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
                    {selectedRepository.complexity && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 min-w-[100px]">Complexity:</span>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                          {selectedRepository.complexity}
                        </span>
                      </div>
                    )}
                    {selectedRepository.tags && (
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-400 min-w-[100px] mt-1">Tags:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedRepository.tags.split(', ').map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Code Preview */}
              {selectedRepository.code && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Code Preview</h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      <code>{selectedRepository.code}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <FiStar className="w-4 h-4" />
                    <span>Star Repository</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <FiGitBranch className="w-4 h-4" />
                    <span>Fork Repository</span>
                  </button>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={`/repository/${selectedRepository.id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>View Full Repository</span>
                  </Link>
                  <button
                    onClick={handleRepoModalClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Repository Item Component ---------- //
function RepositoryItem({ 
  repo, 
  isOwner = false, 
  onDelete,
  onRepositoryClick
}: { 
  repo: Repository; 
  isOwner?: boolean;
  onDelete?: (id: string) => void;
  onRepositoryClick?: (repo: Repository) => void;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative hover:transform hover:scale-[1.02] scroll-smooth">
      {isOwner && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
            title="View Details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            title="Edit Repository"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete && onDelete(repo.id)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete Repository"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className={isOwner ? 'pr-20' : ''}>
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="text-xl font-semibold text-blue-400 hover:underline cursor-pointer"
            onClick={() => onRepositoryClick && onRepositoryClick(repo)}
          >
            {repo.name}
          </h3>
          {isOwner && (
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
              Your Repository
            </span>
          )}
        </div>
        <p className="text-gray-400 mb-4">{repo.description}</p>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <FiCode /> {repo.language}
          </span>
          <span className="flex items-center gap-1">
            <FiStar /> {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 7l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {repo.forks_count}
          </span>
          {repo.complexity && (
            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
              {repo.complexity}
            </span>
          )}
          <span className="text-xs">
            Created on {new Date(repo.created_at).toLocaleDateString()}
          </span>
          {repo.tags && (
            <span className="text-xs text-blue-400">
              {repo.tags.split(', ').slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}