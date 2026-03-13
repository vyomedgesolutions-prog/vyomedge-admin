import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  HiOutlineHome, 
  HiOutlineDocumentText, 
  HiOutlineBriefcase,
  HiOutlineCog,
  HiOutlineInbox,
  HiOutlineUsers,
  HiOutlineLogout 
} from 'react-icons/hi'

const navItems = [
  { path: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/blogs', icon: HiOutlineDocumentText, label: 'Blogs' },
  { path: '/portfolio', icon: HiOutlineBriefcase, label: 'Portfolio' },
  { path: '/services', icon: HiOutlineCog, label: 'Services' },
  { path: '/inquiries', icon: HiOutlineInbox, label: 'Inquiries' },
  { path: '/subscribers', icon: HiOutlineUsers, label: 'Subscribers' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-darker border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">Vyom</span>
          <span className="text-accent">Edge</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
