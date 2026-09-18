import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CreatorDashboard from './pages/creator/Dashboard'
import CreatorProfilePage from './pages/creator/Profile'
import CreatorPortfolioPage from './pages/creator/Portfolio'
import AIPortfolioBuilderPage from './pages/creator/AIBuilder'
import CreatorGigsPage from './pages/creator/Gigs'
import BookingsPage from './pages/creator/Bookings'
import MessagesPage from './pages/creator/Messages'
import EarningsPage from './pages/creator/Earnings'
import CreatorAnalyticsPage from './pages/creator/Analytics'
import ClientDashboard from './pages/client/Dashboard'
import PostJobPage from './pages/client/PostJob'
import BrowseCreatorsPage from './pages/client/BrowseCreators'
import CreatorPublicProfilePage from './pages/client/CreatorProfile'
import ClientReviewsPage from './pages/client/Reviews'
import NotificationsPage from './pages/shared/Notifications'
import SettingsPage from './pages/shared/Settings'
import NotFoundPage from './pages/shared/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute roles={['creator']} />}>
                <Route path="/creator" element={<DashboardLayout variant="creator" />}>
                  <Route index element={<CreatorDashboard />} />
                  <Route path="profile" element={<CreatorProfilePage />} />
                  <Route path="portfolio" element={<CreatorPortfolioPage />} />
                  <Route path="ai-builder" element={<AIPortfolioBuilderPage />} />
                  <Route path="gigs" element={<CreatorGigsPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="earnings" element={<EarningsPage />} />
                  <Route path="analytics" element={<CreatorAnalyticsPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={['client']} />}>
                <Route path="/client" element={<DashboardLayout variant="client" />}>
                  <Route index element={<ClientDashboard />} />
                  <Route path="post-job" element={<PostJobPage />} />
                  <Route path="creators" element={<BrowseCreatorsPage />} />
                  <Route path="creators/:id" element={<CreatorPublicProfilePage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="reviews" element={<ClientReviewsPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="/app" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1C1C24',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
              },
            }}
          />
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  )
}
