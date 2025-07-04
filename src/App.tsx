import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import LoginPage from './pages/LoginPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  // 如果用户已登录但在登录页，根据角色重定向
  if (user && location.pathname === '/login') {
    if (isAdmin) {
      console.log('管理员用户，重定向到后台')
      return <Navigate to="/admin" replace />
    } else {
      console.log('普通用户，重定向到首页')
      return <Navigate to="/" replace />
    }
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!user ? <LoginPage /> : <Navigate to={isAdmin ? "/admin" : "/"} replace />} 
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="movie/:id" element={<MovieDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App 