import axios from 'axios'

const apiHost = (typeof window !== 'undefined' && (window.__MM_API_URL || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('MM_API_URL')) || (typeof localStorage !== 'undefined' && localStorage.getItem('MM_API_URL')))) || import.meta.env.VITE_API_URL || 'https://mess-manager-backend-5q6y.onrender.com'
const api = axios.create({
  baseURL: apiHost.replace(/\/$/, '') + '/api',
  withCredentials: false,
})

let accessToken = null
let refreshToken = null

export function setAccessToken(token) {
  accessToken = token
  try {
    if (token) sessionStorage.setItem('MM_AT', token)
    else sessionStorage.removeItem('MM_AT')
  } catch {}
}
export function setRefreshToken(token) {
  refreshToken = token
  try {
    if (token) sessionStorage.setItem('MM_RT', token)
    else sessionStorage.removeItem('MM_RT')
  } catch {}
}
export function setApiHost(url) {
  if (!url) return
  sessionStorage.setItem('MM_API_URL', url)
  api.defaults.baseURL = url.replace(/\/$/, '') + '/api'
}
export function getSavedAccessToken() {
  try { return sessionStorage.getItem('MM_AT') } catch { return null }
}
export function getSavedRefreshToken() {
  try { return sessionStorage.getItem('MM_RT') } catch { return null }
}

api.interceptors.request.use((config) => {
  if (!accessToken) {
    const at = getSavedAccessToken()
    if (at) accessToken = at
  }
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Refresh flow using header refresh token (no cookies)
api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config || {}
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      try {
        if (!refreshToken) refreshToken = getSavedRefreshToken()
        if (!refreshToken) throw new Error('no refresh token')
        const { data } = await api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${refreshToken}` } })
        setAccessToken(data.accessToken)
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (e) {
        setAccessToken(null); setRefreshToken(null)
      }
    }
    return Promise.reject(error)
  }
)

export default api
