import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiRepeat, 
  FiShare, 
  FiMoreHorizontal,
  FiTrendingUp,
  FiUsers,
  FiBookmark,
  FiLink,
  FiImage,
  FiVideo,
  FiEdit3,
  FiTrash2,
  FiFlag,
  FiEye,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import { Post, KUser, Comment, getUserById, getCommentsByPostId } from '../data/mockDatabase';

interface PostComponentProps {
  post: Post;
  onLike?: (postId: string) => void;
  onRetweet?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  showFullContent?: boolean;
  isDetailView?: boolean;
}

export const PostComponent: React.FC<PostComponentProps> = ({
  post,
  onLike,
  onRetweet,
  onComment,
  onShare,
  onUserClick,
  showFullContent = false,
  isDetailView = false
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showComments, setShowComments] = useState(isDetailView);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isDetailView || showComments) {
      const postComments = getCommentsByPostId(post.id);
      setComments(postComments);
    }
  }, [post.id, isDetailView, showComments]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleRetweet = () => {
    setIsRetweeted(!isRetweeted);
    onRetweet?.(post.id);
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onComment?.(post.id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    onShare?.(post.id);
  };

  const handleUserClick = () => {
    onUserClick?.(post.userId);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would create a new comment
      setNewComment('');
    }
  };

  const formatTime = (timestamp: Date) => {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  const renderMedia = () => {
    if (post.images && post.images.length > 0) {
      return (
        <div className={`mt-3 grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} rounded-lg overflow-hidden`}>
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-64 object-cover hover:opacity-95 transition-opacity cursor-pointer"
              onClick={() => {/* Open image viewer */}}
            />
          ))}
        </div>
      );
    }

    if (post.video) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden">
          <video
            src={post.video}
            controls
            className="w-full max-h-96 object-cover"
          />
        </div>
      );
    }

    return null;
  };

  const renderLinkPreview = () => {
    if (!post.linkPreview) return null;

    return (
      <div className="mt-3 border border-gray-600 rounded-lg overflow-hidden hover:border-gray-500 transition-colors">
        <a href={post.linkPreview.url} target="_blank" rel="noopener noreferrer" className="block">
          {post.linkPreview.image && (
            <img
              src={post.linkPreview.image}
              alt={post.linkPreview.title}
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-3">
            <h4 className="text-blue-400 font-medium text-sm mb-1">{post.linkPreview.title}</h4>
            <p className="text-gray-400 text-xs line-clamp-2">{post.linkPreview.description}</p>
            <div className="flex items-center mt-2 text-gray-500 text-xs">
              <FiLink className="w-3 h-3 mr-1" />
              {new URL(post.linkPreview.url).hostname}
            </div>
          </div>
        </a>
      </div>
    );
  };

  const renderPoll = () => {
    if (!post.poll) return null;

    return (
      <div className="mt-3 border border-gray-600 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">{post.poll.question}</h4>
        <div className="space-y-2">
          {post.poll.options.map((option, index) => {
            const percentage = post.poll!.totalVotes > 0 ? (option.votes / post.poll!.totalVotes) * 100 : 0;
            return (
              <div key={index} className="relative">
                <button className="w-full text-left p-3 border border-gray-600 rounded hover:border-gray-500 transition-colors relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-blue-600/20 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="relative flex justify-between">
                    <span className="text-white">{option.text}</span>
                    <span className="text-gray-400">{percentage.toFixed(1)}%</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-gray-400 text-sm">
          {post.poll.totalVotes.toLocaleString()} votes • Ends {formatTime(post.poll.endsAt)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <img
            src={post.userAvatar}
            alt={post.displayName}
            className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleUserClick}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUserClick}
                className="font-semibold text-white hover:underline truncate"
              >
                {post.displayName}
              </button>
              {post.isVerified && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <span className="text-gray-400 text-sm">@{post.username}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 text-sm">{formatTime(post.timestamp)}</span>
              {post.edited && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500 text-sm flex items-center">
                    <FiEdit3 className="w-3 h-3 mr-1" />
                    edited
                  </span>
                </>
              )}
            </div>
            {post.community && (
              <div className="mt-1">
                <span className="text-blue-400 text-sm hover:underline cursor-pointer">
                  r/{post.community}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* More Options */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <FiMoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center">
                <FiBookmark className="w-4 h-4 mr-2" />
                Save
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center">
                <FiFlag className="w-4 h-4 mr-2" />
                Report
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center">
                <FiEye className="w-4 h-4 mr-2" />
                Hide
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className={`text-white leading-relaxed ${showFullContent ? '' : 'line-clamp-4'}`}>
          {post.content}
        </p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-blue-400 text-sm hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {renderMedia()}
        
        {/* Link Preview */}
        {renderLinkPreview()}
        
        {/* Poll */}
        {renderPoll()}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 hover:text-red-400 transition-colors ${
              isLiked ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm">{(post.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
          </button>

          {/* Comment */}
          <button
            onClick={handleComment}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments.toLocaleString()}</span>
          </button>

          {/* Retweet */}
          <button
            onClick={handleRetweet}
            className={`flex items-center space-x-2 hover:text-green-400 transition-colors ${
              isRetweeted ? 'text-green-400' : 'text-gray-400'
            }`}
          >
            <FiRepeat className="w-4 h-4" />
            <span className="text-sm">{(post.retweets + (isRetweeted ? 1 : 0)).toLocaleString()}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <FiShare className="w-4 h-4" />
            <span className="text-sm">{post.shares.toLocaleString()}</span>
          </button>
        </div>

        {/* Post type indicator */}
        <div className="flex items-center space-x-2 text-gray-500">
          {post.type === 'image' && <FiImage className="w-4 h-4" />}
          {post.type === 'video' && <FiVideo className="w-4 h-4" />}
          {post.type === 'link' && <FiLink className="w-4 h-4" />}
          {post.type === 'poll' && <FiTrendingUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-gray-600 pt-4">
          {/* Add Comment */}
          <div className="flex space-x-3 mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="Your avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                rows={2}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentComponentProps {
  comment: Comment;
  isReply?: boolean;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment, isReply = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      // In a real app, this would create a new reply
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  return (
    <div className={`${isReply ? 'ml-6' : ''}`}>
      <div className="flex space-x-3">
        <img
          src={comment.userAvatar}
          alt={comment.displayName}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-white text-sm">{comment.displayName}</span>
              <span className="text-gray-400 text-sm">@{comment.username}</span>
              <span className="text-gray-500 text-xs">{formatDistanceToNow(comment.timestamp, { addSuffix: true })}</span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs hover:text-red-400 transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              <FiThumbsUp className="w-3 h-3" />
              <span>{comment.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
              >
                Reply
              </button>
            )}
            
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 flex space-x-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="Your avatar"
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white placeholder-gray-400 text-sm resize-none"
                  rows={2}
                />
                <div className="mt-1 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white text-xs transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {showReplies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentComponent key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};