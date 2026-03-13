import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getServices, deleteService } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    try {
      const { data } = await getServices()
      setServices(data.services || [])
    } catch (error) {
      toast.error('Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return

    try {
      await deleteService(id)
      toast.success('Service deleted')
      fetchServices()
    } catch (error) {
      toast.error('Failed to delete service')
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
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-gray-500 mt-1">{services.length} total services</p>
        </div>
        <Link
          to="/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-all"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No services yet</p>
          <Link
            to="/services/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary rounded-lg"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add your first service
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service._id} className="glass rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{service.icon || '⚙️'}</span>
                  <div>
                    <h3 className="text-lg font-bold">{service.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      service.isPublished 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {service.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>

              {service.deliverables?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Deliverables:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.deliverables.slice(0, 3).map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                        {item}
                      </span>
                    ))}
                    {service.deliverables.length > 3 && (
                      <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500">
                        +{service.deliverables.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <Link
                  to={`/services/${service._id}`}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <HiOutlinePencil className="w-5 h-5 text-blue-400" />
                </Link>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <HiOutlineTrash className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
