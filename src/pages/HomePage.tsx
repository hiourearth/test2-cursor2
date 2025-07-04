import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MovieWithStats } from '../types/supabase'
import { useAuth } from '../hooks/useAuth'
import MovieCard from '../components/MovieCard'
import LoadingSpinner from '../components/LoadingSpinner'

const HomePage = () => {
  const [movies, setMovies] = useState<MovieWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { isAdmin } = useAuth()

  useEffect(() => {
    loadMovies()
  }, [])

  const loadMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movie_stats')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMovies(data || [])
    } catch (error: any) {
      setError(error.message || '加载电影列表失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={loadMovies}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          重新加载
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          热门电影
        </h1>
        <p className="text-gray-600">
          发现并评价最新最热门的电影
        </p>
                 {isAdmin && (
           <div className="mt-4">
             <Link
               to="/admin"
               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
             >
               🛠️ 进入管理后台
             </Link>
           </div>
         )}
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">暂无电影数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage 