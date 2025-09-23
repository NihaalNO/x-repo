// Mock Database for Posts/Tweets and Users
export interface KUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  location?: string;
  website?: string;
  joinedDate: Date;
  followers: number;
  following: number;
  verified: boolean;
  coverImage?: string;
  karma: number;
  badges: string[];
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  userAvatar: string;
  content: string;
  images?: string[];
  video?: string;
  type: 'text' | 'image' | 'video' | 'link' | 'poll';
  timestamp: Date;
  likes: number;
  retweets: number;
  comments: number;
  shares: number;
  tags: string[];
  community?: string;
  isVerified: boolean;
  edited?: boolean;
  editedAt?: Date;
  linkPreview?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    endsAt: Date;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  displayName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: Comment[];
  parentId?: string;
}

export interface Community {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  banner: string;
  members: number;
  category: string;
  rules: string[];
  moderators: string[];
  createdAt: Date;
}

// Mock K-Users Database
export const MOCK_USERS: KUser[] = [
  {
    id: "user_001",
    username: "quantum_alice",
    displayName: "Alice Cooper",
    email: "alice@quantum.dev",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Quantum computing researcher & AI enthusiast. Building the future one qubit at a time 🔬⚛️",
    location: "San Francisco, CA",
    website: "https://quantumalice.dev",
    joinedDate: new Date("2023-01-15"),
    followers: 12500,
    following: 847,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=200&fit=crop",
    karma: 98450,
    badges: ["Early Adopter", "Quantum Expert", "Top Contributor"]
  },
  {
    id: "user_002",
    username: "dev_bob",
    displayName: "Bob Smith",
    email: "bob@techcorp.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Full-stack developer | React enthusiast | Coffee addict ☕️ | Open source contributor",
    location: "Austin, TX",
    website: "https://bobdev.io",
    joinedDate: new Date("2022-06-20"),
    followers: 8900,
    following: 1205,
    verified: false,
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=200&fit=crop",
    karma: 45670,
    badges: ["Code Ninja", "React Master"]
  },
  {
    id: "user_003",
    username: "ai_sarah",
    displayName: "Dr. Sarah Johnson",
    email: "sarah@airesearch.edu",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "PhD in AI/ML | Research Scientist | Passionate about ethical AI and quantum machine learning",
    location: "Cambridge, MA",
    website: "https://mit.edu/~sarah",
    joinedDate: new Date("2021-09-10"),
    followers: 25600,
    following: 623,
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=200&fit=crop",
    karma: 156789,
    badges: ["AI Pioneer", "Research Lead", "Top Contributor", "Verified Expert"]
  },
  {
    id: "user_004",
    username: "crypto_charlie",
    displayName: "Charlie Brown",
    email: "charlie@blocktech.io",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Blockchain developer | Crypto enthusiast | DeFi builder | Web3 advocate 🚀",
    location: "Miami, FL",
    joinedDate: new Date("2022-03-05"),
    followers: 15200,
    following: 934,
    verified: false,
    karma: 67890,
    badges: ["Crypto Expert", "Blockchain Builder"]
  },
  {
    id: "user_005",
    username: "design_diana",
    displayName: "Diana Lee",
    email: "diana@designstudio.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "UX/UI Designer | Digital artist | Tech design consultant | Making technology beautiful ✨",
    location: "Seattle, WA",
    website: "https://dianadesigns.com",
    joinedDate: new Date("2022-11-12"),
    followers: 9800,
    following: 1456,
    verified: false,
    karma: 38920,
    badges: ["Design Guru", "Creative Mind"]
  }
];

// Mock Posts/Tweets Database
export const MOCK_POSTS: Post[] = [
  {
    id: "post_001",
    userId: "user_001",
    username: "quantum_alice",
    displayName: "Alice Cooper",
    userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content: "Just achieved quantum supremacy in our latest experiment! 🎉 The implications for cryptography and optimization are mind-blowing. Can't wait to share more details at the upcoming quantum conference.",
    type: "text",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 2847,
    retweets: 892,
    comments: 156,
    shares: 234,
    tags: ["quantum", "research", "breakthrough"],
    community: "QuantumComputing",
    isVerified: true,
    linkPreview: {
      title: "Quantum Supremacy Achieved",
      description: "Latest breakthrough in quantum computing research",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
      url: "https://quantumalice.dev/breakthrough"
    }
  },
  {
    id: "post_002",
    userId: "user_002",
    username: "dev_bob",
    displayName: "Bob Smith",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "New React 18 features are absolutely game-changing! The concurrent rendering and automatic batching are making our apps so much smoother. Here's a quick demo of the new useTransition hook:",
    images: ["https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"],
    type: "image",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    likes: 1543,
    retweets: 423,
    comments: 89,
    shares: 156,
    tags: ["react", "javascript", "frontend"],
    community: "WebDev",
    isVerified: false
  },
  {
    id: "post_003",
    userId: "user_003",
    username: "ai_sarah",
    displayName: "Dr. Sarah Johnson",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "Exciting developments in quantum machine learning! Our latest paper shows 40% improvement in classification accuracy using quantum neural networks. The future of AI is quantum! 🧠⚛️",
    type: "text",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    likes: 3821,
    retweets: 1156,
    comments: 298,
    shares: 445,
    tags: ["AI", "quantum", "machinelearning", "research"],
    community: "ArtificialIntelligence",
    isVerified: true,
    poll: {
      question: "What's the most promising application of quantum ML?",
      options: [
        { text: "Drug discovery", votes: 1234 },
        { text: "Financial modeling", votes: 892 },
        { text: "Climate simulation", votes: 1567 },
        { text: "Cryptography", votes: 743 }
      ],
      totalVotes: 4436,
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  },
  {
    id: "post_004",
    userId: "user_004",
    username: "crypto_charlie",
    displayName: "Charlie Brown",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    content: "🚀 DeFi is revolutionizing finance! Just deployed a new smart contract that reduces gas fees by 60%. Web3 is the future and we're building it today! #BuildingTheFuture",
    type: "text",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    likes: 986,
    retweets: 234,
    comments: 67,
    shares: 89,
    tags: ["DeFi", "blockchain", "web3", "smartcontracts"],
    community: "Cryptocurrency",
    isVerified: false
  },
  {
    id: "post_005",
    userId: "user_005",
    username: "design_diana",
    displayName: "Diana Lee",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    content: "Design thinking meets quantum computing! Created this visualization of quantum state superposition. Love how complex concepts can be made beautiful and intuitive through good design! ✨",
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
    ],
    type: "image",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    likes: 1876,
    retweets: 567,
    comments: 134,
    shares: 289,
    tags: ["design", "visualization", "quantum", "UI"],
    community: "DesignTech",
    isVerified: false
  },
  {
    id: "post_006",
    userId: "user_001",
    username: "quantum_alice",
    displayName: "Alice Cooper",
    userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    content: "Hot take: Quantum computing will make current encryption methods obsolete within the next decade. We need to start preparing for post-quantum cryptography NOW. The security implications are massive! 🔐",
    type: "text",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    likes: 4521,
    retweets: 1823,
    comments: 456,
    shares: 678,
    tags: ["quantum", "cryptography", "security", "future"],
    community: "CyberSecurity",
    isVerified: true,
    edited: true,
    editedAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
  }
];

// Mock Comments Database
export const MOCK_COMMENTS: Comment[] = [
  {
    id: "comment_001",
    postId: "post_001",
    userId: "user_002",
    username: "dev_bob",
    displayName: "Bob Smith",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    content: "This is incredible! How does this affect current quantum algorithms?",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    likes: 45,
    replies: []
  },
  {
    id: "comment_002",
    postId: "post_001",
    userId: "user_003",
    username: "ai_sarah",
    displayName: "Dr. Sarah Johnson",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    content: "Congratulations Alice! This opens up so many possibilities for quantum ML applications.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    likes: 67,
    replies: []
  }
];

// Mock Communities Database
export const MOCK_COMMUNITIES: Community[] = [
  {
    id: "comm_001",
    name: "QuantumComputing",
    displayName: "Quantum Computing",
    description: "Discussions about quantum computing, quantum algorithms, and quantum hardware",
    icon: "⚛️",
    banner: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=200&fit=crop",
    members: 125000,
    category: "Science & Technology",
    rules: [
      "Keep discussions relevant to quantum computing",
      "No spam or self-promotion",
      "Be respectful to all members",
      "Share quality content and research"
    ],
    moderators: ["quantum_alice", "ai_sarah"],
    createdAt: new Date("2021-01-01")
  },
  {
    id: "comm_002",
    name: "WebDev",
    displayName: "Web Development",
    description: "Frontend, backend, and full-stack web development discussions",
    icon: "💻",
    banner: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=200&fit=crop",
    members: 89000,
    category: "Programming",
    rules: [
      "Share code responsibly",
      "Help others learn",
      "No homework requests",
      "Keep it professional"
    ],
    moderators: ["dev_bob"],
    createdAt: new Date("2020-05-15")
  }
];

// Helper functions to simulate database operations
export const getUserById = (userId: string): KUser | undefined => {
  return MOCK_USERS.find(user => user.id === userId);
};

export const getUserByUsername = (username: string): KUser | undefined => {
  return MOCK_USERS.find(user => user.username === username);
};

export const getPostsByUserId = (userId: string): Post[] => {
  return MOCK_POSTS.filter(post => post.userId === userId);
};

export const getCommentsByPostId = (postId: string): Comment[] => {
  return MOCK_COMMENTS.filter(comment => comment.postId === postId);
};

export const getAllPosts = (): Post[] => {
  return MOCK_POSTS.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getCommunityByName = (name: string): Community | undefined => {
  return MOCK_COMMUNITIES.find(community => community.name === name);
};