import { useState, useEffect } from 'react'
import { getInquiries, updateInquiry, deleteInquiry } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlineMail, HiOutlinePhone, HiOutlineCheck, HiOutlineClock, HiOutlineX } from 'react-icons/hi'

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchInquiries = async () => {
    try {
      const { data } = await getInquiries()
      setInquiries(data.inquiries || [])
    } catch (error) {
      toast.error('Failed to fetch inquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await updateInquiry(id, { status })
      toast.success('Status updated')
      fetchInquiries()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return

    try {
      await deleteInquiry(id)
      toast.success('Inquiry deleted')
      setSelected(null)
      fetchInquiries()
    } catch (error) {
      toast.error('Failed to delete inquiry')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-400'
      case 'read': return 'bg-yellow-500/20 text-yellow-400'
      case 'responded': return 'bg-green-500/20 text-green-400'
      case 'closed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-gray-500 mt-1">{inquiries.length} total inquiries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 glass rounded-xl p-4 h-[calc(100vh-200px)] overflow-auto">
          {inquiries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No inquiries yet</p>
          ) : (
            <div className="space-y-2">
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry._id}
                  onClick={() => setSelected(inquiry)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selected?._id === inquiry._id
                      ? 'bg-primary/20 border border-primary/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium truncate">{inquiry.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{inquiry.subject || 'No subject'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 glass rounded-xl p-6 h-[calc(100vh-200px)] overflow-auto">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                  <p className="text-gray-400">{selected.subject || 'No subject'}</p>
                </div>
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <HiOutlineMail className="w-5 h-5 text-primary" />
                  {selected.email}
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <HiOutlinePhone className="w-5 h-5 text-accent" />
                    {selected.phone}
                  </a>
                )}
              </div>

              {/* Message */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-400 mb-2">Message</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              {/* Service Interest */}
              {selected.service && (
                <div className="mb-6">
                  <h3 className="text-sm text-gray-400 mb-2">Interested In</h3>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded">
                    {selected.service}
                  </span>
                </div>
              )}

              {/* Status Actions */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-sm text-gray-400 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selected._id, 'read')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selected.status === 'read' ? 'bg-yellow-500/30' : 'bg-yellow-500/10 hover:bg-yellow-500/20'
                    } text-yellow-400`}
                  >
                    <HiOutlineClock className="w-4 h-4" />
                    Read
                  </button>
                  <button
                    onClick={() => handleStatusChange(selected._id, 'responded')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selected.status === 'responded' ? 'bg-green-500/30' : 'bg-green-500/10 hover:bg-green-500/20'
                    } text-green-400`}
                  >
                    <HiOutlineCheck className="w-4 h-4" />
                    Responded
                  </button>
                  <button
                    onClick={() => handleStatusChange(selected._id, 'closed')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      selected.status === 'closed' ? 'bg-gray-500/30' : 'bg-gray-500/10 hover:bg-gray-500/20'
                    } text-gray-400`}
                  >
                    <HiOutlineX className="w-4 h-4" />
                    Closed
                  </button>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-6 text-sm text-gray-500">
                Received: {new Date(selected.createdAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select an inquiry to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
