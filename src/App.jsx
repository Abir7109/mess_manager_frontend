import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './theme.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Extras from './pages/Extras'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GiCookingPot } from 'react-icons/gi'
import { FiHome, FiLogIn, FiUserPlus, FiGrid, FiShield, FiSun, FiMoon } from 'react-icons/fi'

function Protected({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function NavBar() {
  const { user, logout, dark, toggleDark } = useAuth()
  return (
    <header className="nav">
      <Link to="/" className="brand"><GiCookingPot /> Mess Manager</Link>
      <nav>
        <Link to="/"><FiHome /> Home</Link>
        <Link to="/extras"><FiGrid /> Extras</Link>
        {user ? (
          <>
            <Link to="/dashboard"><FiGrid /> Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin"><FiShield /> Admin</Link>}
            <button className="btn pill" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><FiLogIn /> Login</Link>
            <Link to="/register"><FiUserPlus /> Register</Link>
          </>
        )}
        <button className="icon-btn theme-toggle" aria-label="Toggle theme" title="Toggle theme" onClick={toggleDark}>{dark ? <FiSun /> : <FiMoon />}</button>
      </nav>
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
