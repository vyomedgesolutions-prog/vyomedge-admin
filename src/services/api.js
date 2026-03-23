import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://vyomedge-backend.onrender.com";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const login = (data) => api.post("/api/auth/login", data);
export const getMe = () => api.get("/api/auth/me");

export const getBlogs = () => api.get("/api/blogs/admin/all");
export const getBlog = (id) => api.get(`/api/blogs/admin/${id}`);
export const createBlog = (data) => api.post("/api/blogs", data);
export const updateBlog = (id, data) => api.put(`/api/blogs/${id}`, data);
export const deleteBlog = (id) => api.delete(`/api/blogs/${id}`);

export const getPortfolio = () => api.get("/api/portfolio/admin/all");
export const createPortfolio = (data) => api.post("/api/portfolio", data);
export const updatePortfolio = (id, data) => api.put(`/api/portfolio/${id}`, data);
export const deletePortfolio = (id) => api.delete(`/api/portfolio/${id}`);

export const getServices = () => api.get("/api/services/admin/all");
export const createService = (data) => api.post("/api/services", data);
export const updateService = (id, data) => api.put(`/api/services/${id}`, data);
export const deleteService = (id) => api.delete(`/api/services/${id}`);

export const getInquiries = () => api.get("/api/inquiries");
export const getInquiryStats = () => api.get("/api/inquiries/stats");
export const getInquiry = (id) => api.get(`/api/inquiries/${id}`);
export const updateInquiry = (id, data) => api.put(`/api/inquiries/${id}`, data);
export const deleteInquiry = (id) => api.delete(`/api/inquiries/${id}`);

export const getSubscribers = () => api.get("/api/subscribers");
export const deleteSubscriber = (id) => api.delete(`/api/subscribers/${id}`);

export default api;
