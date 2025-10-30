import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import './theme.css'
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const Extras = lazy(() => import('./pages/Extras'))
const UsersPage = lazy(() => import('./pages/Users'))
import { AuthProvider, useAuth } from './context/AuthContext'
import { GiCookingPot } from 'react-icons/gi'
import { FiHome, FiLogIn, FiUserPlus, FiGrid, FiShield, FiSun, FiMoon, FiMenu, FiX, FiUsers } from 'react-icons/fi'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'

function Protected({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function NavBar() {
  const { user, logout, dark, toggleDark } = useAuth()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const LinkItem = ({ to, children }) => <Link to={to} onClick={close}>{children}</Link>

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.documentElement.classList.remove('menu-open'); document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="nav">
      <Link to="/" className="brand" onClick={close}><GiCookingPot /> Mess Manager</Link>

      {/* Desktop nav */}
      <nav className="desktop-nav">
        <Link to="/"><FiHome /> Home</Link>
        <Link to="/extras"><FiGrid /> Extras</Link>
        <Link to="/users"><FiUsers /> Users</Link>
        {user ? (
          <>
            <Link to="/dashboard"><FiGrid /> Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin"><FiShield /> Admin</Link>}
            <button className="btn pill" onClick={() => { logout(); close() }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><FiLogIn /> Login</Link>
            <Link to="/register"><FiUserPlus /> Register</Link>
          </>
        )}
        <button className="icon-btn theme-toggle" aria-label="Toggle theme" title="Toggle theme" onClick={toggleDark}>{dark ? <FiSun /> : <FiMoon />}</button>
      </nav>

      {/* Hamburger for mobile */}
      <button className="icon-btn hamburger-btn" aria-label="Open menu" onClick={() => setOpen(o=>!o)}>
        {open ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="mobile-overlay" onClick={close}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="mobile-menu"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
              <div className="mobile-menu-header">
                <strong><GiCookingPot /> Mess Manager</strong>
                <button className="icon-btn" onClick={close}><FiX /></button>
              </div>
              <div className="mobile-menu-body">
                <LinkItem to="/"><FiHome /> Home</LinkItem>
                <LinkItem to="/dashboard"><FiGrid /> Dashboard</LinkItem>
                {user?.role === 'admin' && <LinkItem to="/admin"><FiShield /> Admin</LinkItem>}
                <LinkItem to="/extras"><FiGrid /> Extras</LinkItem>
                <LinkItem to="/users"><FiUsers /> Users</LinkItem>
                {!user && <LinkItem to="/login"><FiLogIn /> Login</LinkItem>}
                {!user && <LinkItem to="/register"><FiUserPlus /> Register</LinkItem>}
                {user && <button className="btn pill" onClick={() => { logout(); close() }}>Logout</button>}
                <button className="btn pill" onClick={() => { toggleDark(); }}>
                  {dark ? <FiSun /> : <FiMoon />} Theme
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="left">© {new Date().getFullYear()} Abir</div>
      <div className="socials">
        <a href="https://instagram.com/r_m_abir71" target="_blank" rel="noreferrer" aria-label="Instagram">
          <FaInstagram /> <span>@r_m_abir71</span>
        </a>
        <a href="https://wa.me/8801919069898" target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <FaWhatsapp /> <span>+8801919069898</span>
        </a>
      </div>
    </footer>
  )
}

function App() {
  const reduced = useMemo(() => {
    if (typeof window === 'undefined') return 'never'
    const isSmall = window.matchMedia && window.matchMedia('(max-width: 768px)').matches
    const prefers = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ua = navigator.userAgent || ''
    const isAndroid = /Android/i.test(ua)
    return (isSmall || prefers || isAndroid) ? 'always' : 'user'
  }, [])
  return (
    <AuthProvider>
      <MotionConfig reducedMotion={reduced}>
        <Router>
          <NavBar />
          <div className="page-blur">
            <Suspense fallback={<div style={{padding:24}}>Loading…</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
                <Route path="/admin" element={<Protected roles={["admin"]}><Admin /></Protected>} />
                <Route path="/extras" element={<Extras />} />
                <Route path="/users" element={<UsersPage />} />
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </MotionConfig>
    </AuthProvider>
  )
}

export default App
