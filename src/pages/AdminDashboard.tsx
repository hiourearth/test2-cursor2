import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Movie, MovieWithStats, RatingWithUser } from '../types/supabase'
import MovieForm from '../components/MovieForm'
import LoadingSpinner from '../components/LoadingSpinner'

const AdminDashboard = () => {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  
  const [movies, setMovies] = useState<MovieWithStats[]>([])
  const [ratings, setRatings] = useState<RatingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'movies' | 'ratings' | 'users'>('movies')
  const [showAddMovie, setShowAddMovie] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)

  useEffect(() => {
    // 直接加载数据，权限已通过ProtectedRoute保护
    if (user && isAdmin) {
      console.log('管理员用户，加载后台数据')
      loadData()
    }
  }, [user, isAdmin])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadMovies(),
        loadRatings()
      ])
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMovies = async () => {
    const { data, error } = await supabase
      .from('movie_stats')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    setMovies(data || [])
  }

  const loadRatings = async () => {
    const { data, error } = await supabase
      .from('rating_with_user')
      .select(`
        *,
        movies!inner(title)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    setRatings(data || [])
  }

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm('确定要删除这部电影吗？这将同时删除所有相关评分。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId)

      if (error) throw error
      await loadMovies()
    } catch (error: any) {
      console.error('删除电影失败:', error)
      alert('删除电影失败，请重试')
    }
  }

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm('确定要删除这个评分吗？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId)

      if (error) throw error
      await loadRatings()
    } catch (error: any) {
      console.error('删除评分失败:', error)
      alert('删除评分失败，请重试')
    }
  }

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie)
    setShowAddMovie(true)
  }

  const handleMovieSubmitted = () => {
    setShowAddMovie(false)
    setEditingMovie(null)
    loadMovies()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const renderMoviesTab = () => (
    <div className="space-y-6">
      {/* 添加电影按钮 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">电影管理</h3>
        <button
          onClick={() => setShowAddMovie(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + 添加新电影
        </button>
      </div>

      {/* 添加/编辑电影表单 */}
      {showAddMovie && (
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">
            {editingMovie ? '编辑电影' : '添加新电影'}
          </h4>
          <MovieForm
            movie={editingMovie}
            onSubmitted={handleMovieSubmitted}
            onCancel={() => {
              setShowAddMovie(false)
              setEditingMovie(null)
            }}
          />
        </div>
      )}

      {/* 电影列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                电影信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                评分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movies.map((movie) => (
              <tr key={movie.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-16 w-12 rounded object-cover"
                      src={movie.cover_image_url || '/placeholder-movie.svg'}
                      alt={movie.title || ''}
                      referrerPolicy="no-referrer"
                                              onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/placeholder-movie.svg') {
                            target.src = '/placeholder-movie.svg';
                          }
                        }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {movie.title}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {movie.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ⭐ {movie.average_rating?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {movie.rating_count} 个评分
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(movie.created_at!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditMovie(movie as Movie)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie.id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderRatingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">评分管理</h3>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                电影
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                评分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                时间
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ratings.map((rating) => (
              <tr key={rating.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {rating.user_email}
                  </div>
                  <div className="text-sm text-gray-500">
                    {rating.user_role === 'admin' ? '🛠️ 管理员' : '👤 用户'}
                  </div>
                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                   {(rating as any).movies?.title || `电影 ID: ${rating.movie_id}`}
                 </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {'⭐'.repeat(rating.rating || 0)} ({rating.rating}/5)
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(rating.created_at!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteRating(rating.id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🛠️ 管理员后台
              </h1>
            </div>
                         <div className="flex items-center space-x-4">
               <Link
                 to="/"
                 className="text-gray-600 hover:text-gray-900"
               >
                 📱 前台首页
               </Link>
              <span className="text-gray-600">
                欢迎，{user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 标签导航 */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('movies')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'movies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              电影管理
            </button>
            <button
              onClick={() => setActiveTab('ratings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ratings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              评分管理
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div>
          {activeTab === 'movies' && renderMoviesTab()}
          {activeTab === 'ratings' && renderRatingsTab()}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 