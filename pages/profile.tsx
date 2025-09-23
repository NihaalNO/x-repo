import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { UserProfile } from '../components/UserProfile';
import { FiUser, FiSettings, FiCreditCard, FiLogOut } from 'react-icons/fi';
import { logoutUser } from '@/utils/firebase';
import { supabase } from '../types/supabaseclient';
import { KUser, getUserByUsername } from '../data/mockDatabase';

// Mock current user for demo
const CURRENT_USER: KUser = {
  id: 'user_demo',
  username: 'demo_user',
  displayName: 'Demo User',
  email: 'demo@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Welcome to the social platform! I\'m exploring quantum computing and AI.',
  location: 'San Francisco, CA',
  website: 'https://demo-user.dev',
  joinedDate: new Date('2023-01-01'),
  followers: 1250,
  following: 340,
  verified: false,
  coverImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=200&fit=crop',
  karma: 15670,
  badges: ['Early Adopter', 'Active User']
};

export default function Profile() {
  const router = useRouter();
  const [fadeIn, setFadeIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<KUser | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>('user_demo');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Authentication and profile setup
  useEffect(() => {
    const initializeProfile = () => {
      // Simulate authentication
      setIsLoggedIn(true);
      setCurrentUser(CURRENT_USER);
      setFadeIn(true);
      
      // Check if there's a specific user to view from URL
      const { username } = router.query;
      if (username && typeof username === 'string') {
        const targetUser = getUserByUsername(username);
        if (targetUser) {
          setTargetUserId(targetUser.id);
        }
      } else {
        setTargetUserId(CURRENT_USER.id);
      }
    };

    initializeProfile();
  }, [router.query]);

  // Handle click outside profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleFollow = (userId: string) => {
    toast.success('User followed!');
  };

  const handleUnfollow = (userId: string) => {
    toast.success('User unfollowed!');
  };

  const handleMessage = (userId: string) => {
    toast('Messaging feature coming soon!');
  };

  const handleEditProfile = () => {
    toast('Profile editing feature coming soon!');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  return (
    <div className={`min-h-screen bg-black text-white ${fadeIn ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={toggleSidebar}
              className="text-white focus:outline-none"
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                ></path>
              </svg>
            </button>
            <Link href="/" className="text-2xl font-bold ml-4">
              XREPO
            </Link>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center"
            >
              <FiUser className="mr-2" />
              Profile
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
      </nav>
      
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content */}
      <main className={`pt-24 px-8 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto">
          <UserProfile
            userId={targetUserId}
            currentUserId={currentUser?.id}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onMessage={handleMessage}
            onEdit={handleEditProfile}
          />
        </div>
      </main>
    </div>
  );
}