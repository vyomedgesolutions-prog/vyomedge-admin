import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getServices, createService, updateService } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

export default function ServiceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: '⚙️',
    color: '#7600C4',
    deliverables: [''],
    isPublished: true
  })

  useEffect(() => {
    if (isEdit) {
      getServices()
        .then(({ data }) => {
          const service = data.services?.find(s => s._id === id)
          if (service) {
            setForm({
              title: service.title || '',
              description: service.description || '',
              icon: service.icon || '⚙️',
              color: service.color || '#7600C4',
              deliverables: service.deliverables?.length > 0 ? service.deliverables : [''],
              isPublished: service.isPublished ?? true
            })
          }
        })
        .catch(() => toast.error('Failed to fetch service'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit])

  const addDeliverable = () => {
    setForm({ ...form, deliverables: [...form.deliverables, ''] })
  }

  const removeDeliverable = (index) => {
    setForm({ ...form, deliverables: form.deliverables.filter((_, i) => i !== index) })
  }

  const updateDeliverable = (index, value) => {
    const newDeliverables = [...form.deliverables]
    newDeliverables[index] = value
    setForm({ ...form, deliverables: newDeliverables })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...form,
      deliverables: form.deliverables.filter(d => d.trim())
    }

    try {
      if (isEdit) {
        await updateService(id, payload)
        toast.success('Service updated')
      } else {
        await createService(payload)
        toast.success('Service created')
      }
      navigate('/services')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save')
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
        onClick={() => navigate('/services')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back to Services
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Service' : 'Add Service'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="glass rounded-xl p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Service Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Search Engine Optimization"
              required
              className="w-full px-4 py-3 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what this service includes..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Icon */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Icon (Emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="⚙️"
                className="w-full px-4 py-3 rounded-lg text-center text-2xl"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Accent Color</label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-full h-12 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Deliverables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Deliverables</label>
              <button
                type="button"
                onClick={addDeliverable}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            <div className="space-y-3">
              {form.deliverables.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                    placeholder="e.g., Keyword Research & Analysis"
                    className="flex-1 px-4 py-2 rounded-lg"
                  />
                  {form.deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeliverable(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              Publish on website
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
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
