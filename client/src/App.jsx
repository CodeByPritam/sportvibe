import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ReelsPage from './pages/ReelsPage';
import CreatePage from './pages/CreatePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import SearchPage from './pages/SearchPage';
import SportPage from './pages/SportPage';
import ProfilePage from './pages/ProfilePage'

// A wrapper for protected routes that checks for authentication
function ProtectedRoute({ children }) {
  const token = useAuthStore(s => s.accessToken)
  return token ? children : <Navigate to="/auth" replace />
}

// Main application component that sets up routing
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute> <AppLayout /> </ProtectedRoute>}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="reels" element={<ReelsPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="sport/:sport" element={<SportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}