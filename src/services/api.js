import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://vyomedge-backend.onrender.com'
const PANEL    = import.meta.env.VITE_PANEL   || 'vyomedge_in'

const api = axios.create({ baseURL: BASE_URL })

export const getBlogs = async (params = {}) => {
  try {
    const { data } = await api.get(`/api/blogs/all/${PANEL}`, { params })
    return data
  } catch (err) {
    console.error('getBlogs error:', err)
    return null
  }
}

export const getBlogById = async (id) => {
  try {
    const { data } = await api.get(`/api/blogs/${id}/${PANEL}`)
    return data
  } catch (err) {
    console.error('getBlogById error:', err)
    return null
  }
}

export const searchBlogs = async (query) => {
  try {
    const { data } = await api.get(`/api/blogs/${PANEL}/search/allblog`, { params: { query } })
    return data
  } catch (err) {
    console.error('searchBlogs error:', err)
    return null
  }
}

// ✅ FIXED — was /api/portfolio/all/vyomedge_in (wrong server/route)
// Now points to the correct public route on vyomedge-backend.onrender.com
export const getPortfolio = async () => {
  try {
    const { data } = await api.get('/api/portfolio')
    return data
  } catch (err) {
    console.error('getPortfolio error:', err)
    return null
  }
}

export const getServices = async () => {
  try {
    const { data } = await api.get(`/api/service/all/${PANEL}`)
    return data
  } catch (err) {
    console.error('getServices error:', err)
    return null
  }
}

export const getCategories = async () => {
  try {
    const { data } = await api.get(`/api/category/all/${PANEL}`)
    return data
  } catch (err) {
    console.error('getCategories error:', err)
    return null
  }
}

export const submitInquiry = async (formData) => {
  try {
    const { data } = await api.post(`/api/inquiryform/${PANEL}`, formData)
    return data
  } catch (err) {
    console.error('submitInquiry error:', err)
    return null
  }
}

export const subscribe = async (email) => {
  try {
    const { data } = await api.post(`/api/subscribe/${PANEL}`, { email })
    return data
  } catch (err) {
    console.error('subscribe error:', err)
    return null
  }
}

export default api