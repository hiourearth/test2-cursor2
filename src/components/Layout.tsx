import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Layout = () => {
  const { user, userProfile, isAdmin, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                电影评分网站
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      🛠️ 管理后台
                    </Link>
                  )}
                  <div className="text-right">
                    <div className="text-gray-600">
                      欢迎，{user.email}
                    </div>
                    {userProfile && (
                      <div className="text-xs text-gray-500">
                        {isAdmin ? (
                          <span className="text-blue-600 font-medium">🛠️ 管理员</span>
                        ) : (
                          <span>普通用户</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout 