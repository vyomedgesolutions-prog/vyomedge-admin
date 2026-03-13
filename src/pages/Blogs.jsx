import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBlogs, deleteBlog } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBlogs = async () => {
    try {
      const { data } = await getBlogs()
      setBlogs(data.blogs || [])
    } catch (error) {
      toast.error('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return

    try {
      await deleteBlog(id)
      toast.success('Blog deleted')
      fetchBlogs()
    } catch (error) {
      toast.error('Failed to delete blog')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-gray-500 mt-1">{blogs.length} total posts</p>
        </div>
        <Link
          to="/blogs/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No blog posts yet</p>
          <Link
            to="/blogs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-lg"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Title</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Category</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Views</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Date</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <p className="font-medium">{blog.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{blog.excerpt}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      blog.isPublished 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{blog.views || 0}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/blogs/${blog._id}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-5 h-5 text-blue-400" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
