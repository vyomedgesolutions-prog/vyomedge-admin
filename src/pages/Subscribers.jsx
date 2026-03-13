import { useState, useEffect } from 'react'
import { getSubscribers, deleteSubscriber } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlineMail, HiOutlineDownload } from 'react-icons/hi'

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSubscribers = async () => {
    try {
      const { data } = await getSubscribers()
      setSubscribers(data.subscribers || [])
    } catch (error) {
      toast.error('Failed to fetch subscribers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return

    try {
      await deleteSubscriber(id)
      toast.success('Subscriber deleted')
      fetchSubscribers()
    } catch (error) {
      toast.error('Failed to delete subscriber')
    }
  }

  const exportCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.isActive)
    const csv = [
      ['Email', 'Subscribed Date', 'Status'],
      ...activeSubscribers.map(s => [
        s.email,
        new Date(s.createdAt).toLocaleDateString(),
        s.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vyomedge-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const activeCount = subscribers.filter(s => s.isActive).length

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscribers</h1>
          <p className="text-gray-500 mt-1">{activeCount} active subscribers</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
        >
          <HiOutlineDownload className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Subscribers</p>
          <p className="text-3xl font-bold mt-2">{subscribers.length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm">Active</p>
          <p className="text-3xl font-bold mt-2 text-green-400">{activeCount}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm">Unsubscribed</p>
          <p className="text-3xl font-bold mt-2 text-red-400">{subscribers.length - activeCount}</p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <HiOutlineMail className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No subscribers yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Subscribers will appear here when visitors sign up for your newsletter
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Email</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-gray-400 font-medium">Subscribed</th>
                <th className="text-right px-6 py-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                        {subscriber.email.charAt(0).toUpperCase()}
                      </div>
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {subscriber.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      subscriber.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(subscriber.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`mailto:${subscriber.email}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        title="Send Email"
                      >
                        <HiOutlineMail className="w-5 h-5 text-blue-400" />
                      </a>
                      <button
                        onClick={() => handleDelete(subscriber._id)}
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
