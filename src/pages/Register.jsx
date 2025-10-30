import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recoveryType, setRecoveryType] = useState('phone')
  const [recoveryAnswer, setRecoveryAnswer] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(name, email, password, recoveryType, recoveryAnswer)
      nav('/dashboard')
    } catch (e) {
      setError(e?.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:520, margin:'40px auto'}}>
        <h2>Register</h2>
        <form onSubmit={onSubmit} className="grid">
          {error && <div style={{color:'crimson'}}>{error}</div>}
          <label className="label">Name</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />

          <label className="label">Recovery Question</label>
          <select className="input" value={recoveryType} onChange={e=>setRecoveryType(e.target.value)}>
            <option value="phone">Personal number</option>
            <option value="color">Favourite color</option>
          </select>
          <label className="label">Your Answer</label>
          <input className="input" value={recoveryAnswer} onChange={e=>setRecoveryAnswer(e.target.value)} placeholder={recoveryType==='phone' ? 'e.g., 01919...' : 'e.g., blue'} required />

          <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </form>
      </div>
    </div>
  )
}
