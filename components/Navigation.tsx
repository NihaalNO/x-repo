import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'react-hot-toast';
import { initiateGoogleAuth } from '@/utils/auth';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, logoutUser } from '@/utils/firebase';
import { auth } from '@/utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ProfileSetupDialog from './ProfileSetupDialog';

interface NavigationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface CommentProps {
  comment: Comment;
  onReply: (parentId: number, content: string) => void;
  onVote: (commentId: number, isUpvote: boolean) => void;
  onDelete?: (commentId: number) => void;
  depth?: number;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  expertise: string;
  votes: number;
  timestamp: string;
  verified: boolean;
  replies?: Comment[];
  parentId?: number;
  userVote?: 'up' | 'down' | null;
}

const CommentComponent: React.FC<CommentProps> = ({ 
  comment, 
  onReply, 
  onVote, 
  onDelete,
  depth = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const maxDepth = 5; // Maximum nesting level

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <div className={`border-l-2 border-gray-700 pl-4 ${depth > 0 ? 'mt-2' : 'mt-4'}`}>
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-black-400">{comment.author}</span>
          {comment.verified && (
            <span className="bg-black-600 text-xs px-2 py-0.5 rounded-full">
              Verified
            </span>
          )}
          <span className="text-gray-400 text-sm">{comment.timestamp}</span>
        </div>
        
        <p className="text-gray-200 mb-3">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-sm">
          {/* Voting buttons */}
          

          {/* Reply button */}
          {depth < maxDepth && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-gray-400 hover:text-black-400 transition-colors"
            >
              Reply
            </button>
          )}

          {/* Delete button (if owner) */}
          {onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>

        {/* Reply form */}
        {isReplying && (
          <form onSubmit={handleSubmitReply} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 bg-gray-900 rounded-lg border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-black-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim()}
                className="px-4 py-2 text-sm bg-black-600 text-white rounded-lg hover:bg-black-700 transition-colors disabled:bg-black-600/50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
            </div>
          </form>
        )}

        {/* Nested replies */}
        {comment.replies?.map(reply => (
          <CommentComponent
            key={reply.id}
            comment={reply}
            onReply={onReply}
            onVote={onVote}
            onDelete={onDelete}
            depth={depth + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default function Navigation({ isOpen, setIsOpen }: NavigationProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupCard, setShowSignupCard] = useState(false);
  const [signupCredentials, setSignupCredentials] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  // Check if we're on the profile page
  // Redirect to knowledge page if logged in and on homepage
  useEffect(() => {
    if (isLoggedIn && router.pathname === '/') {
      router.push('/knowledge');
    }
  }, [isLoggedIn, router.pathname, router]);

  const handleNavigation = (section: string) => {
    // Close any open cards
    setShowLoginCard(false);
    setShowSignupCard(false);
    
    // Navigate to the section without login check
    if (router.pathname !== '/') {
      router.push(`/#${section}`);
    } else {
      // If already on home page, scroll to section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (credentials.email && credentials.password) {
        await signInWithEmail(credentials.email, credentials.password);
        setIsLoggedIn(true);
        setShowLoginCard(false);
        setCredentials({ email: '', password: '' });
        toast.success('Logged in successfully!');
        router.push('/knowledge');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check passwords match before setting loading state
    if (signupCredentials.password !== signupCredentials.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      if (signupCredentials.email && signupCredentials.password) {
        const userCredential = await signUpWithEmail(signupCredentials.email, signupCredentials.password);
        setIsLoggedIn(true);
        setShowSignupCard(false);
        
        // Store email to associate with profile later
        setNewUserData({
          email: signupCredentials.email,
          uid: userCredential.user.uid
        });
        
        // Reset credentials
        setSignupCredentials({ email: '', password: '', confirmPassword: '' });
        
        // Show profile setup dialog
        setShowProfileSetup(true);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Use Firebase's signInWithRedirect to keep auth in the same tab
      await signInWithGoogle();
      // Do not push to /knowledge here; let _app.tsx handle post-auth redirect
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileSetupComplete = (profileData: any) => {
    // Combine auth data with profile data
    const completeUserData = {
      ...profileData,
      email: newUserData?.email,
      uid: newUserData?.uid
    };
    
    // Save profile data
    localStorage.setItem('userProfile', JSON.stringify(completeUserData));
    localStorage.setItem('profileSetupCompleted', 'true');
    
    // In a real app, you would save this to your database
    console.log('Complete user profile:', completeUserData);
    
    // Show welcome message
    toast.success(`Welcome to XREPO, ${profileData.firstName}!`);
    
    // Redirect to knowledge page
    router.push('/knowledge');
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 text-white p-4 z-40 ">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold">
              XREPO
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {/* Navigation buttons */}
            <button 
              onClick={() => handleNavigation('home')}
              className="text-lg relative group"
            >
              <span className="relative z-10 hover:text-black-400 transition-colors duration-300">Home</span>
            </button>

            <button 
              onClick={() => handleNavigation('about')}
              className="text-lg relative group"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">About</span>
            </button>

            <button 
              onClick={() => handleNavigation('features')}
              className="text-lg relative group"
            >
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Features</span>
            </button>

            {/* Auth buttons - only show Get Started if not logged in */}
            {!isLoggedIn && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSignupCard(true)}
                  className="px-6 py-2 rounded-lg relative overflow-hidden group"
                >
                  <span id="loginbutton" className="relative group-hover:text-white transition-colors duration-300">Get Started</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Login Card with improved styling */}
      {showLoginCard && !isLoggedIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-900/95 w-full max-w-md p-6 border-gray-800">
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
                <button
                  onClick={() => setShowLoginCard(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 rounded-lg bg-gray-600 text-white transition-colors disabled:bg-gray-600"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
                <div className="text-center text-gray-400">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowLoginCard(false);
                      setShowSignupCard(true);
                    }} 
                    className="text-white hover:text-white transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
              <div className="relative my-4 flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="mx-4 flex-shrink text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Signup Card */}
      {showSignupCard && !isLoggedIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-900/95 w-full max-w-md p-6 border-gray-800">
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <button
                  onClick={() => setShowSignupCard(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={signupCredentials.email}
                    onChange={(e) => setSignupCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-black-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupCredentials.password}
                    onChange={(e) => setSignupCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-black-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={signupCredentials.confirmPassword}
                    onChange={(e) => setSignupCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-black-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 rounded-lg bg-gray-600 text-white hover:bg-black-700 transition-colors disabled:bg-black-400"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Creating account...</span>
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </button>
                <div className="text-center text-gray-400">
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowSignupCard(false);
                      setShowLoginCard(true);
                    }} 
                    className="text-white hover:text-black-300 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </form>
              <div className="relative my-4 flex items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="mx-4 flex-shrink text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-white text-gray-800 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
                    <span className="ml-2">Connecting...</span>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Setup Dialog */}
      <ProfileSetupDialog 
        open={showProfileSetup}
        onOpenChange={setShowProfileSetup}
        onComplete={handleProfileSetupComplete}
      />
    </>
  );
}
