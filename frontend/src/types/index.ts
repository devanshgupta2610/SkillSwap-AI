export type UserRole = 'creator' | 'client'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string | null
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  role: UserRole
  user_id: number
}

export interface CreatorProfile {
  id: number
  user_id: number
  headline?: string | null
  bio?: string | null
  skills: string[]
  tags: string[]
  tools: string[]
  experience_years: number
  hourly_rate?: number | null
  location?: string | null
  availability: string
  rating_avg: number
  rating_count: number
  completed_projects: number
  response_rate: number
  trust_score: number
}

export interface ClientProfile {
  id: number
  user_id: number
  company_name?: string | null
  bio?: string | null
  industry?: string | null
  location?: string | null
  website?: string | null
}

export interface PortfolioProject {
  id: number
  creator_id: number
  title: string
  description: string
  skills_used: string[]
  tools_used: string[]
  image_url?: string | null
  pdf_url?: string | null
  project_url?: string | null
  ai_generated: boolean
  created_at: string
}

export interface Gig {
  id: number
  creator_id: number
  title: string
  description: string
  category: string
  tags: string[]
  price: number
  delivery_days: number
  is_active: boolean
  cover_image?: string | null
  views: number
  orders_count: number
  created_at: string
}

export interface Job {
  id: number
  client_id: number
  title: string
  description: string
  required_skills: string[]
  tags: string[]
  budget_min?: number | null
  budget_max?: number | null
  status: string
  created_at: string
}

export interface Milestone {
  id: number
  title: string
  description?: string | null
  amount: number
  is_completed: boolean
  order_index: number
}

export interface Booking {
  id: number
  client_id: number
  creator_id: number
  gig_id?: number | null
  job_id?: number | null
  title: string
  description?: string | null
  amount: number
  status: string
  delivery_url?: string | null
  created_at: string
  milestones: Milestone[]
}

export interface Review {
  id: number
  booking_id: number
  reviewer_id: number
  reviewee_id: number
  rating: number
  feedback: string
  project_verified: boolean
  created_at: string
}

export interface MatchResult {
  creator_id: number
  full_name: string
  headline?: string | null
  compatibility_score: number
  matching_reasons: string[]
  trust_score: number
  rating_avg: number
  skills: string[]
}

export interface NotificationItem {
  id: number
  title: string
  body: string
  type: string
  link?: string | null
  is_read: boolean
  created_at: string
}

export interface DashboardStats {
  total_earnings: number
  active_bookings: number
  completed_bookings: number
  avg_rating: number
  portfolio_count: number
  gig_count: number
  open_jobs: number
  saved_items: number
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  is_read: boolean
  created_at: string
}
