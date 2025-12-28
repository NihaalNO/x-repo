export interface User {
  id: string
  firebase_uid: string
  email: string
  username: string
  display_name: string | null
  bio: string | null
  profile_picture_url: string | null
  location: string | null
  website: string | null
  quantum_interests: string[] | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  readme_content: string | null
  visibility: 'public' | 'private'
  tags: string[]
  star_count: number
  fork_count: number
  created_at: string
  updated_at: string
  user?: User
  files?: ProjectFile[]
}

export interface ProjectFile {
  id: string
  project_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
}

export interface Circuit {
  id: string
  user_id: string
  project_id: string | null
  title: string
  circuit_data: any // JSON serialized Qiskit circuit
  qasm_code: string
  qiskit_code: string | null
  created_at: string
  updated_at: string
}

export interface Community {
  id: string
  name: string
  display_name: string
  description: string | null
  rules: string | null
  created_by: string
  member_count: number
  created_at: string
  created_by_user?: User
}

export interface Post {
  id: string
  community_id: string
  user_id: string
  title: string
  content: string
  post_type: 'text' | 'code' | 'link' | 'image' | 'circuit'
  upvotes: number
  downvotes: number
  comment_count: number
  created_at: string
  updated_at: string
  user?: User
  community?: Community
}

export interface Comment {
  id: string
  post_id: string
  parent_comment_id: string | null
  user_id: string
  content: string
  upvotes: number
  downvotes: number
  created_at: string
  updated_at: string
  user?: User
  replies?: Comment[]
}

export interface Reaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: '👍' | '❤️' | '🚀' | '💡' | '🤔'
  created_at: string
  user?: User
}

export interface Notification {
  id: string
  user_id: string
  type: 'comment_reply' | 'mention' | 'reaction' | 'upvote'
  content: string
  related_id: string
  is_read: boolean
  created_at: string
}

