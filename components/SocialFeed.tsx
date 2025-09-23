import React, { useState, useEffect } from 'react';
import { PostComponent } from './PostComponent';
import { 
  FiHome, 
  FiTrendingUp, 
  FiUsers, 
  FiSearch, 
  FiPlus,
  FiImage,
  FiVideo,
  FiLink,
  FiX,
  FiGlobe,
  FiLock,
  FiSettings,
  FiBarChart
} from 'react-icons/fi';
import { 
  Post, 
  KUser, 
  Community,
  getAllPosts, 
  MOCK_USERS,
  MOCK_COMMUNITIES,
  getUserById
} from '../data/mockDatabase';

interface SocialFeedProps {
  currentUser?: KUser;
  onUserClick?: (userId: string) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ currentUser, onUserClick }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'trending' | 'communities'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [communities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text' as 'text' | 'image' | 'video' | 'link' | 'poll',
    community: '',
    privacy: 'public' as 'public' | 'private',
    tags: [] as string[],
    images: [] as string[]
  });

  useEffect(() => {
    // Simulate loading posts
    const loadPosts = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const allPosts = getAllPosts();
      setPosts(allPosts);
      setIsLoading(false);
    };

    loadPosts();
  }, []);

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;

    const post: Post = {
      id: `post_${Date.now()}`,
      userId: currentUser?.id || 'user_001',
      username: currentUser?.username || 'demo_user',
      displayName: currentUser?.displayName || 'Demo User',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: newPost.content,
      type: newPost.type,
      timestamp: new Date(),
      likes: 0,
      retweets: 0,
      comments: 0,
      shares: 0,
      tags: newPost.tags,
      community: newPost.community || undefined,
      isVerified: currentUser?.verified || false,
      images: newPost.images.length > 0 ? newPost.images : undefined
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({
      content: '',
      type: 'text',
      community: '',
      privacy: 'public',
      tags: [],
      images: []
    });
    setShowCreatePost(false);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleRetweet = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, retweets: post.retweets + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !newPost.tags.includes(tag.trim())) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const trendingPosts = [...filteredPosts].sort((a, b) => 
    (b.likes + b.retweets + b.comments) - (a.likes + a.retweets + a.comments)
  );

  const communityPosts = filteredPosts.filter(post => post.community);

  const getCurrentPosts = () => {
    switch (activeTab) {
      case 'trending':
        return trendingPosts;
      case 'communities':
        return communityPosts;
      default:
        return filteredPosts;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with tabs */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Social Feed</h1>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts, users, communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'home' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FiHome className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'trending' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'communities' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FiUsers className="w-4 h-4" />
            <span>Communities</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create Post</h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium text-white">{currentUser?.displayName || 'Demo User'}</div>
                  <div className="text-sm text-gray-400">@{currentUser?.username || 'demo_user'}</div>
                </div>
              </div>

              {/* Content */}
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's happening?"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Post Type */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'text' }))}
                  className={`p-2 rounded-lg ${newPost.type === 'text' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  📝
                </button>
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'image' }))}
                  className={`p-2 rounded-lg ${newPost.type === 'image' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <FiImage className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'video' }))}
                  className={`p-2 rounded-lg ${newPost.type === 'video' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <FiVideo className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'link' }))}
                  className={`p-2 rounded-lg ${newPost.type === 'link' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <FiLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'poll' }))}
                  className={`p-2 rounded-lg ${newPost.type === 'poll' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <FiBarChart className="w-4 h-4" />
                </button>
              </div>

              {/* Community Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Community (Optional)</label>
                <select
                  value={newPost.community}
                  onChange={(e) => setNewPost(prev => ({ ...prev, community: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white"
                >
                  <option value="">No community</option>
                  {communities.map(community => (
                    <option key={community.id} value={community.name}>
                      r/{community.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-sm flex items-center"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-400 hover:text-blue-300"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Privacy</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setNewPost(prev => ({ ...prev, privacy: 'public' }))}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      newPost.privacy === 'public' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <FiGlobe className="w-4 h-4" />
                    <span>Public</span>
                  </button>
                  <button
                    onClick={() => setNewPost(prev => ({ ...prev, privacy: 'private' }))}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      newPost.privacy === 'private' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <FiLock className="w-4 h-4" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.content.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="p-4 space-y-4">
        {getCurrentPosts().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No posts found</div>
            <div className="text-gray-500 text-sm">
              {searchTerm ? 'Try a different search term' : 'Be the first to create a post!'}
            </div>
          </div>
        ) : (
          getCurrentPosts().map((post) => (
            <PostComponent
              key={post.id}
              post={post}
              onLike={handleLike}
              onRetweet={handleRetweet}
              onComment={handleComment}
              onShare={handleShare}
              onUserClick={onUserClick}
            />
          ))
        )}
      </div>

      {/* Trending Communities Sidebar (if space allows) */}
      {activeTab === 'communities' && (
        <div className="mt-8 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Communities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map((community) => (
              <div key={community.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {community.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">r/{community.name}</h4>
                    <p className="text-sm text-gray-400">{community.members.toLocaleString()} members</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{community.description}</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors">
                  Join Community
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};