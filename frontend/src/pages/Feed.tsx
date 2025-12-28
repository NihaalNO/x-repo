import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState<'home' | 'explore'>('home');
  const [sortType, setSortType] = useState<'hot' | 'new' | 'top' | 'controversial'>('hot');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { userProfile } = useAuth();
  const limit = 25;

  useEffect(() => {
    fetchPosts();
  }, [feedType, sortType, timeRange]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      
      if (feedType === 'home') {
        endpoint = `/posts/feed/home?sort=${sortType}&time_range=${timeRange}&limit=${limit}&offset=${(page - 1) * limit}`;
      } else { // explore
        endpoint = `/posts/feed/explore?sort=${sortType}&time_range=${timeRange}&limit=${limit}&offset=${(page - 1) * limit}`;
      }
      
      const response = await api.get(endpoint);
      const newPosts = response.data.posts || [];
      
      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === limit);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    if (page > 1) {
      fetchPosts();
    }
  }, [page]);

  const refreshFeed = () => {
    setPage(1);
    fetchPosts();
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <button className="text-2xl hover:text-primary-600">
            ▲
          </button>
          <span className="text-lg font-medium">{post.upvotes - post.downvotes}</span>
          <button className="text-2xl hover:text-primary-600">
            ▼
          </button>
        </div>
        <div className="flex-1">
          {post.community && (
            <Link
              to={`/communities/${post.community.name}`}
              className="text-sm text-primary-600 hover:underline mb-2 block"
            >
              r/{post.community.name}
            </Link>
          )}
          <Link to={`/posts/${post.id}`}>
            <h2 className="text-xl font-bold mb-2 hover:underline">{post.title}</h2>
          </Link>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>Posted by {post.user?.display_name || post.user?.username || 'Unknown'}</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <div className="prose max-w-none mb-4">
            {post.post_type === 'text' ? (
              <ReactMarkdown>{post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}</ReactMarkdown>
            ) : (
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                <code>{post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}</code>
              </pre>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link to={`/posts/${post.id}`} className="hover:underline">
              {post.comment_count} comments
            </Link>
            <span>{post.upvotes} upvotes</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">
            {feedType === 'home' ? 'Home Feed' : 'Explore'}
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={feedType}
              onChange={(e) => setFeedType(e.target.value as 'home' | 'explore')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="home">Home</option>
              <option value="explore">Explore</option>
            </select>
            
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as 'hot' | 'new' | 'top' | 'controversial')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="hot">Hot</option>
              <option value="new">New</option>
              <option value="top">Top</option>
              <option value="controversial">Controversial</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month' | 'year' | 'all')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All time</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            
            <button
              onClick={refreshFeed}
              className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {loading && page === 1 ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {userProfile 
              ? feedType === 'home' 
                ? 'No posts in your communities yet. Join more communities to see posts here.' 
                : 'No posts found. Try different filters.'
              : 'Log in to see posts in your feed.'}
          </div>
        ) : (
          <div>
            {posts.map(renderPost)}
            
            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading && page > 1}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading && page > 1 ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}