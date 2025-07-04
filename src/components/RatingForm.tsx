import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { RatingInsert, RatingUpdate } from '../types/supabase'

interface RatingFormProps {
  movieId: string
  onRatingSubmitted: () => void
}

const RatingForm = ({ movieId, onRatingSubmitted }: RatingFormProps) => {
  const { user } = useAuth()
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [existingRating, setExistingRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      loadExistingRating()
    }
  }, [user, movieId])

  const loadExistingRating = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .single()

      if (data && !error) {
        setExistingRating(data.rating)
        setRating(data.rating)
      }
    } catch (error) {
      // 没有找到现有评分，这是正常的
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user || rating === 0) return

    setSubmitting(true)
    try {
      if (existingRating !== null) {
        // 更新现有评分
        const updateData: RatingUpdate = { rating }
        const { error } = await supabase
          .from('ratings')
          .update(updateData)
          .eq('user_id', user.id)
          .eq('movie_id', movieId)

        if (error) throw error
      } else {
        // 创建新评分
        const insertData: RatingInsert = {
          user_id: user.id,
          movie_id: movieId,
          rating,
        }
        const { error } = await supabase
          .from('ratings')
          .insert(insertData)

        if (error) throw error
      }

      setExistingRating(rating)
      onRatingSubmitted()
    } catch (error) {
      console.error('提交评分时出错:', error)
      alert('提交评分失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">请登录后给电影评分</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        {existingRating !== null ? '修改评分' : '给这部电影评分'}
      </h3>
      
      {/* 星级评分 */}
      <div className="flex items-center space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`text-3xl transition-colors ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-500'
                : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={submitting}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-gray-600">
          {rating > 0 ? `${rating} 分` : '点击星星评分'}
        </span>
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
          rating === 0 || submitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {submitting ? '提交中...' : existingRating !== null ? '更新评分' : '提交评分'}
      </button>
    </div>
  )
}

export default RatingForm 