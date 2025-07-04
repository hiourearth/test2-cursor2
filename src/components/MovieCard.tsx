import { Link } from 'react-router-dom'
import { MovieWithStats } from '../types/supabase'

interface MovieCardProps {
  movie: MovieWithStats
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* 电影封面 */}
        <div className="aspect-w-3 aspect-h-4">
          <img
            src={movie.cover_image_url || '/placeholder-movie.jpg'}
            alt={movie.title || ''}
            className="w-full h-64 object-cover"
          />
        </div>
        
        {/* 电影信息 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {movie.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {movie.description || '暂无简介'}
          </p>
          
          {/* 评分信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-500 text-lg font-bold">
                ★ {movie.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-gray-500 text-sm">
              {movie.rating_count || 0} 人评分
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard 