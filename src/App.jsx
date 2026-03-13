import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Blogs from './pages/Blogs'
import BlogForm from './pages/BlogForm'
import Portfolio from './pages/Portfolio'
import PortfolioForm from './pages/PortfolioForm'
import Services from './pages/Services'
import ServiceForm from './pages/ServiceForm'
import Inquiries from './pages/Inquiries'
import Subscribers from './pages/Subscribers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/new" element={<BlogForm />} />
            <Route path="/blogs/:id" element={<BlogForm />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/new" element={<PortfolioForm />} />
            <Route path="/portfolio/:id" element={<PortfolioForm />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/new" element={<ServiceForm />} />
            <Route path="/services/:id" element={<ServiceForm />} />
            <Route path="/inquiries" element={<Inquiries />} />
            <Route path="/subscribers" element={<Subscribers />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#4CFFE7',
              secondary: '#1a1a2e',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4c4c',
              secondary: '#1a1a2e',
            },
          },
        }}
      />
    </AuthProvider>
  )
}
