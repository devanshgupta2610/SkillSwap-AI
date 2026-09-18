import { api } from './api'
import type {
  Booking,
  CreatorProfile,
  ClientProfile,
  DashboardStats,
  Gig,
  Job,
  MatchResult,
  Message,
  NotificationItem,
  PortfolioProject,
  Review,
  TokenResponse,
  User,
  UserRole,
} from '../types'

export const authApi = {
  register: (body: { email: string; password: string; full_name: string; role: UserRole }) =>
    api.post<TokenResponse>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', body).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
}

export const creatorApi = {
  profile: () => api.get<CreatorProfile>('/creator/profile').then((r) => r.data),
  updateProfile: (body: Partial<CreatorProfile>) =>
    api.put<CreatorProfile>('/creator/profile', body).then((r) => r.data),
  dashboard: () => api.get<DashboardStats>('/creator/dashboard').then((r) => r.data),
  portfolio: () => api.get<PortfolioProject[]>('/creator/portfolio').then((r) => r.data),
  createPortfolio: (body: Record<string, unknown>) =>
    api.post<PortfolioProject>('/creator/portfolio', body).then((r) => r.data),
  upload: (file: File, kind = 'image') => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    return api.post<{ url: string }>('/creator/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  analytics: () => api.get('/creator/analytics').then((r) => r.data),
}

export const clientApi = {
  profile: () => api.get<ClientProfile>('/client/profile').then((r) => r.data),
  updateProfile: (body: Partial<ClientProfile>) =>
    api.put<ClientProfile>('/client/profile', body).then((r) => r.data),
  dashboard: () => api.get<DashboardStats>('/client/dashboard').then((r) => r.data),
  createJob: (body: Record<string, unknown>) => api.post<Job>('/jobs', body).then((r) => r.data),
  jobs: (mine = true) => api.get<Job[]>('/jobs', { params: { mine } }).then((r) => r.data),
  matches: (jobId: number) =>
    api.get<MatchResult[]>(`/client/jobs/${jobId}/matches`).then((r) => r.data),
  creators: (params?: { q?: string; skill?: string }) =>
    api.get('/client/creators', { params }).then((r) => r.data),
  creatorProfile: (id: number) => api.get(`/client/creators/${id}`).then((r) => r.data),
  saveCreator: (id: number) => api.post(`/client/creators/${id}/save`).then((r) => r.data),
  analytics: () => api.get('/client/analytics').then((r) => r.data),
}

export const gigApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<Gig[]>('/gigs', { params }).then((r) => r.data),
  get: (id: number) => api.get<Gig>(`/gigs/${id}`).then((r) => r.data),
  create: (body: Record<string, unknown>) => api.post<Gig>('/gigs', body).then((r) => r.data),
  update: (id: number, body: Record<string, unknown>) =>
    api.put<Gig>(`/gigs/${id}`, body).then((r) => r.data),
  remove: (id: number) => api.delete(`/gigs/${id}`),
  save: (id: number) => api.post(`/gigs/${id}/save`).then((r) => r.data),
}

export const bookingApi = {
  list: () => api.get<Booking[]>('/booking').then((r) => r.data),
  get: (id: number) => api.get<Booking>(`/booking/${id}`).then((r) => r.data),
  create: (body: Record<string, unknown>) => api.post<Booking>('/booking', body).then((r) => r.data),
  update: (id: number, body: Record<string, unknown>) =>
    api.put<Booking>(`/booking/${id}`, body).then((r) => r.data),
}

export const reviewApi = {
  create: (body: { booking_id: number; rating: number; feedback: string }) =>
    api.post<Review>('/review', body).then((r) => r.data),
  forCreator: (id: number) => api.get<Review[]>(`/review/creator/${id}`).then((r) => r.data),
}

export const chatApi = {
  send: (body: { recipient_id: number; content: string; booking_id?: number }) =>
    api.post<Message>('/messages', body).then((r) => r.data),
  thread: (peerId: number) => api.get<Message[]>(`/messages/${peerId}`).then((r) => r.data),
}

export const sharedApi = {
  notifications: () => api.get<NotificationItem[]>('/notifications').then((r) => r.data),
  markRead: (id: number) => api.post<NotificationItem>(`/notifications/${id}/read`).then((r) => r.data),
  assistant: (prompt: string, context?: string) =>
    api.post<{ reply: string }>('/ai/assistant', { prompt, context }).then((r) => r.data),
  pricing: (body: Record<string, unknown>) => api.post('/ai/pricing', body).then((r) => r.data),
}
