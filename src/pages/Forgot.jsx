import { useState } from 'react'
import api from '../api/client'

export default function Forgot() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function fetchQuestion(e) {
    e.preventDefault()
    setError(''); setMsg('')
    try {
      const { data } = await api.post('/auth/recovery-question', { email })
      setPrompt(data.prompt || 'Verification')
      setStep(2)
    } catch (e) {
      setError(e?.response?.data?.error || 'Account not found')
    }
  }
  async function reset(e) {
    e.preventDefault()
    setError(''); setMsg('')
    try {
      await api.post('/auth/reset-password', { email, answer, newPassword })
      setMsg('Password reset successful. You can log in now.')
      setStep(3)
    } catch (e) {
      setError(e?.response?.data?.error || 'Verification failed')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:480, margin:'40px auto'}}>
        <h2>Forgot Password</h2>
        {step===1 && (
          <form className="grid" onSubmit={fetchQuestion}>
            {error && <div style={{color:'crimson'}}>{error}</div>}
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <button className="btn">Continue</button>
          </form>
        )}
        {step===2 && (
          <form className="grid" onSubmit={reset}>
            {error && <div style={{color:'crimson'}}>{error}</div>}
            <label className="label">{prompt}</label>
            <input className="input" value={answer} onChange={e=>setAnswer(e.target.value)} required />
            <label className="label">New Password</label>
            <input className="input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
            <button className="btn">Reset Password</button>
          </form>
        )}
        {step===3 && (
          <div>
            {msg && <div style={{color:'seagreen', marginBottom:8}}>{msg}</div>}
            <a className="btn teal" href="#/login" onClick={(e)=>{e.preventDefault(); window.location.assign('#/login')}}>Go to Login</a>
          </div>
        )}
      </div>
    </div>
  )
}