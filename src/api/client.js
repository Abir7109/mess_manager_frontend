import axios from 'axios'

const apiHost = (typeof window !== 'undefined' && (window.__MM_API_URL || localStorage.getItem('MM_API_URL'))) || import.meta.env.VITE_API_URL || 'https://mess-manager-backend-5q6y.onrender.com'
const api = axios.create({
  baseURL: apiHost.replace(/\/$/, '') + '/api',
  withCredentials: true,
})

let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}
export function setApiHost(url) {
  if (!url) return
  localStorage.setItem('MM_API_URL', url)
  api.defaults.baseURL = url.replace(/\/$/, '') + '/api'
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshing = null
async function refreshToken() {
  if (!refreshing) {
    refreshing = api.post('/auth/refresh').then(res => res.data.accessToken).finally(() => { refreshing = null })
  }
  return refreshing
}

api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      try {
        const token = await refreshToken()
        setAccessToken(token)
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (e) {
        // fallthrough
      }
    }
    return Promise.reject(error)
  }
)

export default api
