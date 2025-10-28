import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Extras() {
  const { user } = useAuth()
  // Voting
  const [suggestions, setSuggestions] = useState([])
  const [title, setTitle] = useState('')
  const [forDate, setForDate] = useState('')
  // Expenses
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [shared, setShared] = useState(true)
  // Notifications
  const [notifs, setNotifs] = useState([])

  async function loadSuggestions() {
    const { data } = await api.get('/community/suggestions')
    setSuggestions(data)
  }
  async function loadNotifs() {
    const { data } = await api.get('/notifications/mine')
    setNotifs(data)
  }

  useEffect(() => { loadSuggestions(); loadNotifs() }, [])

  async function addSuggestion(e) {
    e.preventDefault()
    if (!title.trim()) return
    await api.post('/community/suggestions', { title, forDate })
    setTitle(''); setForDate('')
    loadSuggestions()
  }

  async function toggleVote(id) {
    await api.post(`/community/suggestions/${id}/vote`)
    loadSuggestions()
  }

  async function addExpense(e) {
    e.preventDefault()
    const body = { amount: Number(amount), description: desc, shared }
    await api.post('/expenses', body)
    setAmount(''); setDesc('')
    alert('Expense saved')
  }

  return (
    <div className="container">
      <div className="grid cols-2">
        <div className="card">
          <h2 style={{marginTop:0}}>Meal Voting</h2>
          <form className="grid" onSubmit={addSuggestion}>
            <label className="label">Suggestion</label>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Friday Biriyani" />
            <label className="label">For Date (optional)</label>
            <input className="input" type="date" value={forDate} onChange={e=>setForDate(e.target.value)} />
            <button className="btn teal">Add</button>
          </form>
          <div style={{marginTop:12}}>
            {suggestions.map(s => (
              <div key={s.id} className="card" style={{marginTop:8, padding:12, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:800}}>{s.title}</div>
                  <div style={{opacity:.8, fontSize:12}}>{s.forDate || ''}</div>
                </div>
                <button className="btn" onClick={() => toggleVote(s.id)}>{s.voted ? 'Unvote' : 'Vote'} ({s.votes})</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{marginTop:0}}>Expense Splitter</h2>
          <form className="grid" onSubmit={addExpense}>
            <label className="label">Amount (৳)</label>
            <input className="input" type="number" value={amount} onChange={e=>setAmount(e.target.value)} required />
            <label className="label">Description</label>
            <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="e.g., Rice + Oil" />
            <label className="label">Shared with all?</label>
            <input type="checkbox" checked={shared} onChange={e=>setShared(e.target.checked)} />
            <button className="btn teal">Save Expense</button>
          </form>
          <p style={{opacity:.8, fontSize:12}}>Note: shared expenses auto-split among all users.</p>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h2 style={{marginTop:0}}>Notifications</h2>
        {notifs.length === 0 ? <p>No alerts 🎉</p> : (
          <ul>
            {notifs.map((n, i) => <li key={i}>{n.message}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
