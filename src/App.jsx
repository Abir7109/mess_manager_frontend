import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './theme.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Extras from './pages/Extras'
import { AuthProvider, useAuth } from './context/AuthContext'

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
      <Link to="/" className="brand">Mess Manager</Link>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/extras">Extras</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin">Admin</Link>}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <button onClick={toggleDark}>{dark ? 'Light' : 'Dark'}</button>
      </nav>
    </header>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
