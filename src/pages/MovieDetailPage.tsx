import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MovieWithStats, RatingWithUser } from '../types/supabase'
import RatingForm from '../components/RatingForm'
import LoadingSpinner from '../components/LoadingSpinner'

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieWithStats | null>(null)
  const [ratings, setRatings] = useState<RatingWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadMovieDetail()
      loadRatings()
    }
  }, [id])

  const loadMovieDetail = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('movie_stats')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setMovie(data)
    } catch (error: any) {
      setError(error.message || '加载电影详情失败')
    } finally {
      setLoading(false)
    }
  }

  const loadRatings = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('rating_with_user')
        .select('*')
        .eq('movie_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRatings(data || [])
    } catch (error: any) {
      console.error('加载评分列表失败:', error)
    }
  }

  const handleRatingSubmitted = () => {
    loadMovieDetail()
    loadRatings()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">
          {error || '电影不存在'}
        </p>
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          ← 返回首页
        </Link>
      </div>

      {/* 电影详情 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="md:flex">
          {/* 电影封面 */}
          <div className="md:w-1/3">
            <img
              src={movie.cover_image_url || '/placeholder-movie.jpg'}
              alt={movie.title || ''}
              className="w-full h-96 md:h-full object-cover"
            />
          </div>
          
          {/* 电影信息 */}
          <div className="md:w-2/3 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {movie.title}
            </h1>
            
            {/* 评分显示 */}
            <div className="flex items-center mb-6">
              <span className="text-yellow-500 text-2xl font-bold mr-2">
                ★ {movie.average_rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-gray-600">
                ({movie.rating_count || 0} 人评分)
              </span>
            </div>

            {/* 电影简介 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                剧情简介
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {movie.description || '暂无简介'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 评分区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 评分表单 */}
        <div className="lg:col-span-1">
          <RatingForm
            movieId={id!}
            onRatingSubmitted={handleRatingSubmitted}
          />
        </div>

        {/* 评分列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              用户评分 ({ratings.length})
            </h3>
            
            {ratings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                暂无评分，成为第一个评分的人吧！
              </p>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-bold">
                          {'★'.repeat(rating.rating || 0)}
                          {'☆'.repeat(5 - (rating.rating || 0))}
                        </span>
                        <span className="ml-2 text-gray-600">
                          {rating.rating || 0} 分
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(rating.created_at!).toLocaleDateString()}
                      </span>
                    </div>
                    {/* 显示用户邮箱 */}
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm">
                        👤 {rating.user_email || '匿名用户'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailPage 