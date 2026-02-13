export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface FollowCounts {
  followers: number
  following: number
}

export interface FollowerWithProfile {
  follow_id: string
  user_id: string
  username: string | null
  created_at: string
}

export interface FollowingWithProfile {
  follow_id: string
  user_id: string
  username: string | null
  created_at: string
}
