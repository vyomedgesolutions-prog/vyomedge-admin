import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBlog, createBlog, updateBlog } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft } from 'react-icons/hi'

export default function BlogForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'General',
    tags: '',
    featuredImage: '',
    isPublished: true
  })

  useEffect(() => {
    if (isEdit) {
      getBlog(id)
        .then(({ data }) => {
          const blog = data.blog
          setForm({
            title: blog.title || '',
            content: blog.content || '',
            excerpt: blog.excerpt || '',
            category: blog.category || 'General',
            tags: blog.tags?.join(', ') || '',
            featuredImage: blog.featuredImage || '',
            isPublished: blog.isPublished ?? true
          })
        })
        .catch(() => toast.error('Failed to fetch blog'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    try {
      if (isEdit) {
        await updateBlog(id, payload)
        toast.success('Blog updated')
      } else {
        await createBlog(payload)
        toast.success('Blog created')
      }
      navigate('/blogs')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save blog')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => navigate('/blogs')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back to Blogs
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Blog' : 'New Blog Post'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="glass rounded-xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter blog title"
              required
              className="w-full px-4 py-3 rounded-lg"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your blog content..."
              required
              rows={12}
              className="w-full px-4 py-3 rounded-lg resize-y"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short description (auto-generated if empty)"
              rows={3}
              className="w-full px-4 py-3 rounded-lg resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg"
              >
                <option value="General">General</option>
                <option value="SEO">SEO</option>
                <option value="Marketing">Marketing</option>
                <option value="Web Development">Web Development</option>
                <option value="Social Media">Social Media</option>
                <option value="Case Study">Case Study</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-3 rounded-lg"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Featured Image URL</label>
            <input
              type="url"
              value={form.featuredImage}
              onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-lg"
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="isPublished" className="text-sm">
              Publish immediately
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/80 transition-all font-semibold disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Blog' : 'Create Blog'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
