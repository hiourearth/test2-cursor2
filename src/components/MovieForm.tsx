import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Movie } from '../types/supabase'

interface MovieFormProps {
  movie?: Movie | null
  onSubmitted: () => void
  onCancel: () => void
}

const MovieForm = ({ movie, onSubmitted, onCancel }: MovieFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (movie) {
      setTitle(movie.title)
      setDescription(movie.description || '')
      setCoverImageUrl(movie.cover_image_url || '')
    }
  }, [movie])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('电影标题不能为空')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (movie) {
        // 更新电影
        const { error } = await supabase
          .from('movies')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            cover_image_url: coverImageUrl.trim() || null,
          })
          .eq('id', movie.id)

        if (error) throw error
      } else {
        // 创建新电影
        const { error } = await supabase
          .from('movies')
          .insert({
            title: title.trim(),
            description: description.trim() || null,
            cover_image_url: coverImageUrl.trim() || null,
          })

        if (error) throw error
      }

      onSubmitted()
    } catch (error: any) {
      console.error('提交电影信息失败:', error)
      setError(error.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          电影标题 *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入电影标题"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          电影简介
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="请输入电影简介"
        />
      </div>

      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          封面图片链接
        </label>
        <input
          id="coverImageUrl"
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/image.jpg"
        />
        <div className="mt-2 text-sm text-gray-600">
          <p className="mb-1">💡 推荐图片来源：</p>
          <ul className="text-xs space-y-1 ml-4">
            <li>• <a href="https://unsplash.com" target="_blank" className="text-blue-600 hover:underline">Unsplash（免费高质量图片）</a></li>
            <li>• <a href="https://tmdb.org" target="_blank" className="text-blue-600 hover:underline">TMDB（电影数据库）</a></li>
            <li>• <a href="https://imgur.com" target="_blank" className="text-blue-600 hover:underline">Imgur（图片托管）</a></li>
          </ul>
          <p className="mt-2 text-orange-600">⚠️ 豆瓣图片有防盗链保护，可能无法显示</p>
        </div>
        
        {/* 图片预览 */}
        {coverImageUrl && (
          <div className="mt-3">
            <p className="text-sm text-gray-700 mb-2">图片预览：</p>
            <img
              src={coverImageUrl}
              alt="图片预览"
              className="w-32 h-48 object-cover rounded border"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = target.nextElementSibling as HTMLElement;
                if (errorDiv) {
                  errorDiv.style.display = 'block';
                }
              }}
            />
            <div style={{ display: 'none' }} className="w-32 h-48 bg-gray-200 rounded border flex items-center justify-center text-gray-500 text-sm">
              图片加载失败
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '保存中...' : movie ? '更新电影' : '添加电影'}
        </button>
      </div>
    </form>
  )
}

export default MovieForm 