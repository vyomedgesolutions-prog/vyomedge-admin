import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPortfolio, deletePortfolio } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'

export default function Portfolio() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    try {
      const { data } = await getPortfolio()
      setItems(data.portfolio || [])
    } catch (error) {
      toast.error('Failed to fetch portfolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return

    try {
      await deletePortfolio(id)
      toast.success('Portfolio item deleted')
      fetchItems()
    } catch (error) {
      toast.error('Failed to delete item')
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
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-gray-500 mt-1">{items.length} total items</p>
        </div>
        <Link
          to="/portfolio/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No portfolio items yet</p>
          <Link
            to="/portfolio/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-lg"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-3xl">{item.icon || '📁'}</span>
                  <h3 className="text-lg font-bold mt-2">{item.client}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.isPublished 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-sm text-gray-500">
                  DA: {item.metrics?.da || 0} | PA: {item.metrics?.pa || 0}
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/portfolio/${item._id}`}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <HiOutlinePencil className="w-5 h-5 text-blue-400" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                  >
                    <HiOutlineTrash className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
