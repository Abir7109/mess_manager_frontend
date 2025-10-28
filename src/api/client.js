import axios from 'axios'

const apiHost = (typeof window !== 'undefined' && (window.__MM_API_URL || localStorage.getItem('MM_API_URL'))) || import.meta.env.VITE_API_URL || 'https://mess-manager-backend-5q6y.onrender.com'
const api = axios.create({
  baseURL: apiHost.replace(/\/$/, '') + '/api',
  withCredentials: true,
})

let accessToken = null

export function setAccessToken(token) {
  accessToken = token
  try {
    if (token) localStorage.setItem('MM_AT', token)
    else localStorage.removeItem('MM_AT')
  } catch {}
}
export function setApiHost(url) {
  if (!url) return
  localStorage.setItem('MM_API_URL', url)
  api.defaults.baseURL = url.replace(/\/$/, '') + '/api'
}
export function getSavedAccessToken() {
  try { return localStorage.getItem('MM_AT') } catch { return null }
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Disable refresh flow for cross-site cookie environments; rely on DB session cookie
api.interceptors.response.use(
  r => r,
  async (error) => {
    return Promise.reject(error)
  }
)

export default api
