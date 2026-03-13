import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInquiryStats, getBlogs, getPortfolio, getSubscribers } from '../services/api'
import { 
  HiOutlineDocumentText, 
  HiOutlineBriefcase, 
  HiOutlineInbox, 
  HiOutlineUsers,
  HiOutlineTrendingUp
} from 'react-icons/hi'

export default function Dashboard() {
  const [stats, setStats] = useState({
    blogs: 0,
    portfolio: 0,
    inquiries: { total: 0, unread: 0, thisWeek: 0 },
    subscribers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogsRes, portfolioRes, inquiriesRes, subscribersRes] = await Promise.all([
          getBlogs(),
          getPortfolio(),
          getInquiryStats(),
          getSubscribers()
        ])

        setStats({
          blogs: blogsRes.data.blogs?.length || 0,
          portfolio: portfolioRes.data.portfolio?.length || 0,
          inquiries: inquiriesRes.data || { total: 0, unread: 0, thisWeek: 0 },
          subscribers: subscribersRes.data.activeCount || 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: 'Total Blogs',
      value: stats.blogs,
      icon: HiOutlineDocumentText,
      color: 'bg-blue-500/20 text-blue-400',
      link: '/blogs'
    },
    {
      title: 'Portfolio Items',
      value: stats.portfolio,
      icon: HiOutlineBriefcase,
      color: 'bg-purple-500/20 text-purple-400',
      link: '/portfolio'
    },
    {
      title: 'Inquiries',
      value: stats.inquiries.total,
      subtitle: `${stats.inquiries.unread} unread`,
      icon: HiOutlineInbox,
      color: 'bg-green-500/20 text-green-400',
      link: '/inquiries'
    },
    {
      title: 'Subscribers',
      value: stats.subscribers,
      icon: HiOutlineUsers,
      color: 'bg-cyan-500/20 text-cyan-400',
      link: '/subscribers'
    },
  ]

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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="glass rounded-xl p-6 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
                {card.subtitle && (
                  <p className="text-sm text-accent mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HiOutlineTrendingUp className="text-accent" />
            This Week
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Inquiries</span>
              <span className="text-2xl font-bold text-accent">{stats.inquiries.thisWeek}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${Math.min((stats.inquiries.thisWeek / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/blogs/new"
              className="px-4 py-3 bg-primary/20 text-primary rounded-lg text-center hover:bg-primary/30 transition-all"
            >
              New Blog Post
            </Link>
            <Link
              to="/portfolio/new"
              className="px-4 py-3 bg-secondary/20 text-secondary rounded-lg text-center hover:bg-secondary/30 transition-all"
            >
              Add Portfolio
            </Link>
            <Link
              to="/inquiries"
              className="px-4 py-3 bg-accent/20 text-accent rounded-lg text-center hover:bg-accent/30 transition-all"
            >
              View Inquiries
            </Link>
            <Link
              to="/services/new"
              className="px-4 py-3 bg-blue-500/20 text-blue-400 rounded-lg text-center hover:bg-blue-500/30 transition-all"
            >
              Add Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
