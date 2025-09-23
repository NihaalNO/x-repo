import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiCalendar, 
  FiMapPin, 
  FiLink as FiLinkIcon, 
  FiEdit3, 
  FiSettings,
  FiUserPlus,
  FiUserCheck,
  FiMessageCircle,
  FiMoreHorizontal,
  FiShield,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiStar,
  FiBookmark,
  FiShare,
  FiFlag
} from 'react-icons/fi';
import { PostComponent } from './PostComponent';
import { 
  KUser, 
  Post, 
  getUserById, 
  getPostsByUserId, 
  MOCK_USERS 
} from '../data/mockDatabase';

interface UserProfileProps {
  userId: string;
  currentUserId?: string;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  currentUserId,
  onFollow,
  onUnfollow,
  onMessage,
  onEdit
}) => {
  const [user, setUser] = useState<KUser | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userData = getUserById(userId);
      if (userData) {
        setUser(userData);
        const posts = getPostsByUserId(userId);
        setUserPosts(posts);
        
        // Simulate following status (in real app, this would come from API)
        setIsFollowing(Math.random() > 0.5);
      }
      
      setIsLoading(false);
    };

    loadUserProfile();
  }, [userId]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setIsFollowing(false);
      onUnfollow?.(userId);
    } else {
      setIsFollowing(true);
      onFollow?.(userId);
    }
  };

  const handleMessage = () => {
    onMessage?.(userId);
  };

  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'media':
        return userPosts.filter(post => post.images || post.video);
      case 'likes':
        // In a real app, this would be posts the user liked
        return userPosts.slice(0, 2);
      case 'replies':
        // In a real app, this would show replies/comments
        return userPosts.filter(post => post.content.includes('@'));
      default:
        return userPosts;
    }
  };

  const isOwnProfile = currentUserId === userId;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-700 rounded-lg"></div>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-700 rounded w-32"></div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">User not found</div>
        <div className="text-gray-500 text-sm">The user you're looking for doesn't exist.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="relative">
        <div 
          className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mb-6"
          style={{
            backgroundImage: user.coverImage ? `url(${user.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {isOwnProfile && (
            <button 
              onClick={onEdit}
              className="absolute bottom-4 right-4 bg-gray-900/70 hover:bg-gray-900/90 p-2 rounded-lg transition-colors"
            >
              <FiEdit3 className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative -mt-16 px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between space-y-4 md:space-y-0">
          {/* Avatar and Basic Info */}
          <div className="flex items-end space-x-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-900 bg-gray-900"
              />
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            
            <div className="pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                {user.displayName}
                {user.verified && (
                  <FiShield className="w-5 h-5 text-blue-500 ml-2" />
                )}
              </h1>
              <p className="text-gray-400 text-lg">@{user.username}</p>
              
              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.badges.slice(0, 3).map((badge, index) => (
                    <span
                      key={index}
                      className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      <FiAward className="w-3 h-3 mr-1" />
                      {badge}
                    </span>
                  ))}
                  {user.badges.length > 3 && (
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                      +{user.badges.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {!isOwnProfile && (
              <>
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <FiUserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleMessage}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span>Message</span>
                </button>
              </>
            )}
            
            {isOwnProfile && (
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <FiEdit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}

            {/* More Options */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <FiMoreHorizontal className="w-4 h-4 text-white" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-12 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center text-white">
                    <FiShare className="w-4 h-4 mr-2" />
                    Share Profile
                  </button>
                  {!isOwnProfile && (
                    <>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center text-white">
                        <FiBookmark className="w-4 h-4 mr-2" />
                        Save Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center text-red-400">
                        <FiFlag className="w-4 h-4 mr-2" />
                        Report
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio and Details */}
        <div className="mt-6 space-y-4">
          {user.bio && (
            <p className="text-gray-300 leading-relaxed max-w-2xl">{user.bio}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
            {user.location && (
              <div className="flex items-center">
                <FiMapPin className="w-4 h-4 mr-1" />
                {user.location}
              </div>
            )}
            
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:text-blue-400 transition-colors"
              >
                <FiLinkIcon className="w-4 h-4 mr-1" />
                {new URL(user.website).hostname}
              </a>
            )}
            
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-1" />
              Joined {formatDistanceToNow(user.joinedDate, { addSuffix: true })}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <button className="hover:underline">
              <span className="font-semibold text-white">{user.following.toLocaleString()}</span>
              <span className="text-gray-400 ml-1">Following</span>
            </button>
            <button className="hover:underline">
              <span className="font-semibold text-white">{user.followers.toLocaleString()}</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </button>
            <div className="flex items-center">
              <FiStar className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-semibold text-white">{user.karma.toLocaleString()}</span>
              <span className="text-gray-400 ml-1">Karma</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b border-gray-700">
          <nav className="flex space-x-8">
            {[
              { key: 'posts', label: 'Posts', count: userPosts.length },
              { key: 'replies', label: 'Replies', count: userPosts.filter(p => p.content.includes('@')).length },
              { key: 'media', label: 'Media', count: userPosts.filter(p => p.images || p.video).length },
              { key: 'likes', label: 'Likes', count: 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Posts Content */}
      <div className="mt-6 px-6">
        {getFilteredPosts().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {activeTab === 'posts' && 'No posts yet'}
              {activeTab === 'replies' && 'No replies yet'}
              {activeTab === 'media' && 'No media posts yet'}
              {activeTab === 'likes' && 'No liked posts yet'}
            </div>
            <div className="text-gray-500 text-sm">
              {isOwnProfile 
                ? 'Start sharing your thoughts with the community!'
                : `${user.displayName} hasn't ${activeTab === 'posts' ? 'posted' : activeTab === 'replies' ? 'replied to' : activeTab === 'media' ? 'shared media' : 'liked'} anything yet.`
              }
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredPosts().map((post) => (
              <PostComponent
                key={post.id}
                post={post}
                showFullContent={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load More Button */}
      {getFilteredPosts().length > 0 && (
        <div className="mt-8 text-center px-6">
          <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};