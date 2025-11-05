import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAccessToken, getSavedAccessToken } from '../api/client'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [dark, setDark] = useState(() => localStorage.getItem('mm_dark') === '1')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mm_dark', dark ? '1' : '0')
  }, [dark])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    setUser(data.user)
    setAccessToken(data.accessToken)
    if (data.refreshToken) {
      const { setRefreshToken } = await import('../api/client')
      setRefreshToken(data.refreshToken)
    }
    reportLocation().catch(() => {})
  }

  async function register(name, email, password, recoveryType, recoveryAnswer) {
    await api.post('/auth/register', { name, email, password, recoveryType, recoveryAnswer })
    return login(email, password)
  }

  async function logout() {
    try { await api.post('/auth/logout') } catch {}
    setUser(null)
    setAccessToken(null)
  }

  async function loadMe() {
    try {
      const { data } = await api.get('/users/me')
      setUser(data)
      reportLocation().catch(() => {})
    } catch (e) {
      // not logged in
    }
  }

  useEffect(() => {
    const at = getSavedAccessToken()
    if (at) {
      setAccessToken(at)
      loadMe()
    }
  }, [])

  async function updateProfile(fields) {
    const { data } = await api.patch('/users/me', fields)
    setUser(data)
  }

  const value = useMemo(() => ({ user, login, register, logout, updateProfile, dark, toggleDark: () => setDark(d => !d) }), [user, dark])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

async function reportLocation() {
  try {
    let pos
    try {
      const mod = await import('@capacitor/geolocation')
      pos = await mod.Geolocation.getCurrentPosition()
    } catch {
      // fallback to browser API
      pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('geolocation not supported'))
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 })
      })
    }
    const { latitude, longitude, accuracy } = pos.coords
    await api.post('/users/me/location', { latitude, longitude, accuracy })
  } catch {}
}

export function useAuth() {
  return useContext(AuthCtx)
}
