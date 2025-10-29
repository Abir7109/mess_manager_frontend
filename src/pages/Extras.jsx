import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Extras() {
  const { user } = useAuth()
  // Voting
  const [suggestions, setSuggestions] = useState([])
  
  async function apiDeleteCascade(paths = []) {
    let lastErr
    for (const p of paths) {
      try { await api.delete(p); return true } catch (e) { lastErr = e }
    }
    throw lastErr
  }
  async function removeSuggestion(id) {
    const sid = id
    // Try multiple backends: DELETE (param), DELETE (body), POST fallbacks, alt paths
    const attempts = [
      () => api.delete(`/community/suggestions/${sid}`),
      () => api.delete('/community/suggestions', { data: { id: sid } }),
      () => api.post('/community/suggestions/delete', { id: sid }),
      () => api.post('/community/suggestions/remove', { id: sid }),
      () => api.delete(`/admin/community/suggestions/${sid}`),
      () => api.delete('/admin/community/suggestions', { data: { id: sid } }),
      () => api.post('/admin/community/suggestions/delete', { id: sid }),
      () => api.post('/admin/community/suggestions/remove', { id: sid }),
      () => api.delete(`/suggestions/${sid}`),
      () => api.delete('/suggestions', { data: { id: sid } }),
      () => api.post('/suggestions/delete', { id: sid }),
    ]
    let lastErr
    for (const fn of attempts) {
      try { await fn(); return true } catch (e) { lastErr = e }
    }
    const msg = lastErr?.response?.data?.error || lastErr?.message || 'Failed to remove suggestion'
    throw new Error(msg)
  }
  const [title, setTitle] = useState('')
  const [forDate, setForDate] = useState('')
  // Expenses
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [shared, setShared] = useState(true)
  // Notifications
  const [notifs, setNotifs] = useState([])
  // Shared expenses history
  const [sharedList, setSharedList] = useState([])

  async function loadSuggestions() {
    const { data } = await api.get('/community/suggestions')
    setSuggestions(data)
  }
  async function loadNotifs() {
    const { data } = await api.get('/notifications/mine')
    setNotifs(data)
  }

  useEffect(() => { loadSuggestions(); loadNotifs(); loadShared() }, [])

  async function addSuggestion(e) {
    e.preventDefault()
    if (!title.trim()) return
    await api.post('/community/suggestions', { title, forDate })
    setTitle(''); setForDate('')
    loadSuggestions()
  }

  async function toggleVote(id) {
    const sid = id
    try {
      await api.post(`/community/suggestions/${sid}/vote`)
    } catch (err) {
      const code = err?.response?.status
      if (code===404 || code===403) {
        await api.post(`/admin/community/suggestions/${sid}/vote`)
      } else {
        alert(err?.response?.data?.error || 'Failed to vote')
        throw err
      }
    }
    loadSuggestions()
  }

  async function addExpense(e) {
    e.preventDefault()
    const body = { amount: Number(amount), description: desc, shared, splitMode: 'equal_all' }
    await api.post('/expenses', body)
    setAmount(''); setDesc('')
    alert('Expense saved')
    await loadShared()
  }

  async function loadShared() {
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
      const r = await api.get('/expenses/shared',{ params:{ month } })
      setSharedList(r.data.shared || [])
    } catch {
      setSharedList([])
    }
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
                <div style={{display:'flex',gap:8}}>
                  <button type="button" className="btn" onClick={() => toggleVote(s._id || s.id)}>{s.voted ? 'Unvote' : 'Vote'} ({s.votes})</button>
                  {user?.role==='admin' && <button type="button" className="btn" onClick={async()=>{
                    if(!confirm('Remove this suggestion?')) return
                    const id = s._id || s.id
                    if(!id) return alert('Missing id')
                    // optimistic UI
                    setSuggestions(prev => prev.filter(x => (x._id||x.id) !== id))
                    try {
                      await removeSuggestion(id)
                    } catch (err) {
                      alert(err?.message || 'Failed to remove suggestion')
                      // reload to sync truth if backend rejected
                      await loadSuggestions()
                      return
                    }
                    // ensure list is fresh from server
                    await loadSuggestions()
                  }}>Remove</button>}
                </div>
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
            {notifs.map((n, i) => <li key={i}>{n.message} {n.type==='low_balance' && <span className="desc">— To recharge, contact an admin (Admins can update balances in Users).</span>}</li>)}
          </ul>
        )}
      </div>

      <div className="card" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}>Shared expenses (this month)</h3>
        <p className="desc">History of shared expenses. Admins can delete entries.</p>
        <div className="scroll-x">
          <table className="table wide">
            <thead>
              <tr><th>Date</th><th>By</th><th>Amount</th><th>Description</th><th>Participants</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sharedList.map(e => (
                <tr key={e._id}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>{e.user?.name||'-'}</td>
                  <td>{e.amount}</td>
                  <td>{e.description||'-'}</td>
                  <td>{(e.participants||[]).map(p=>p.name).join(', ')}</td>
                  <td>{user?.role==='admin' && <button type="button" className="btn" onClick={async()=>{
                    if(!confirm('Delete this shared expense?')) return
                    const id = e._id || e.id
                    if(!id) return alert('Missing id')
                    try {
                      await apiDeleteCascade([`/expenses/${id}`, `/admin/expenses/${id}`])
                    } catch (err) {
                      alert(err?.response?.data?.error || 'Failed to delete expense')
                      return
                    }
                    await loadShared()
                  }}>Delete</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
