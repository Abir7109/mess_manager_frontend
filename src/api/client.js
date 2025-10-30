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

export function toAbsoluteUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const base = api.defaults.baseURL?.replace(/\/api$/, '') || ''
  return base + url
}

api.interceptors.request.use((config) => {
  if (!accessToken) {
    const at = getSavedAccessToken()
    if (at) accessToken = at
  }
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Refresh flow using header refresh token (no cookies) with de-dupe
let refreshInFlight = null
api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config || {}
    const status = error?.response?.status
    const url = original?.url || ''
    if (status === 401 && !original._retry && !url.includes('/auth/refresh')) {
      original._retry = true
      try {
        if (!refreshToken) refreshToken = getSavedRefreshToken()
        if (!refreshToken) {
          setAccessToken(null); setRefreshToken(null)
          return Promise.reject(error)
        }
        if (!refreshInFlight) {
          refreshInFlight = api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${refreshToken}` } })
            .then(({ data }) => { setAccessToken(data.accessToken); return data.accessToken })
            .catch((e) => { setAccessToken(null); setRefreshToken(null); throw e })
            .finally(() => { refreshInFlight = null })
        }
        const token = await refreshInFlight
        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (e) {
        // fallthrough: let the original 401 propagate
      }
    }
    return Promise.reject(error)
  }
)

export default api
