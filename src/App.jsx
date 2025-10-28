import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './theme.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Extras from './pages/Extras'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GiCookingPot } from 'react-icons/gi'
import { FiHome, FiLogIn, FiUserPlus, FiGrid, FiShield, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi'

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

  return (
    <header className="nav">
      <Link to="/" className="brand" onClick={close}><GiCookingPot /> Mess Manager</Link>

      {/* Desktop nav */}
      <nav className="desktop-nav">
        <Link to="/"><FiHome /> Home</Link>
        <Link to="/extras"><FiGrid /> Extras</Link>
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/admin" element={<Protected roles={["admin"]}><Admin /></Protected>} />
          <Route path="/extras" element={<Extras />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
