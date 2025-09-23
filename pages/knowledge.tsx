import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { SocialFeed } from '../components/SocialFeed';
import { FiUser, FiSettings, FiCreditCard, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { logoutUser } from '@/utils/firebase';
import { KUser } from '../data/mockDatabase';

// Mock current user for demo
const CURRENT_USER: KUser = {
  id: 'user_knowledge',
  username: 'knowledge_seeker',
  displayName: 'Knowledge Seeker',
  email: 'seeker@knowledge.dev',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  bio: 'Passionate about learning and sharing knowledge in quantum computing and technology.',
  location: 'Knowledge Hub',
  website: 'https://knowledge-seeker.dev',
  joinedDate: new Date('2023-02-10'),
  followers: 1456,
  following: 234,
  verified: true,
  coverImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=200&fit=crop',
  karma: 78900,
  badges: ['Knowledge Expert', 'Top Contributor', 'Community Leader']
};

export default function Knowledge() {
  const router = useRouter();
  
  // State management
  const [fadeIn, setFadeIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<KUser | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Authentication and user setup
  useEffect(() => {
    // Simulate authentication check
    setIsLoggedIn(true);
    setCurrentUser(CURRENT_USER);
    setFadeIn(true);
  }, []);

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

  const handleUserClick = (userId: string) => {
    router.push(`/profile?user=${userId}`);
  };

  return (
    <div className={`min-h-screen bg-black text-white transition-opacity duration-500`}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black text-white p-4 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold ml-4">
              XREPO
            </Link>
          </div>

          {/* Profile Button with Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center"
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
        </div>
      </nav>

      {/* Sidebar - always fixed and open */}
      <Sidebar isOpen={true} setIsOpen={() => {}} />

      {/* Main Content */}
      <main className="pt-24 px-8 transition-all duration-300 ml-72">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Knowledge Base</h1>
            <p className="text-gray-400 text-lg">
              Share your quantum computing knowledge and discover insights from the community
            </p>
          </div>
          
          {/* Social Feed Component */}
          <SocialFeed
            currentUser={currentUser || undefined}
            onUserClick={handleUserClick}
          />
        </div>
      </main>
    </div>
  );
}
