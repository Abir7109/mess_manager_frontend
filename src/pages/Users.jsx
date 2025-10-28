import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import api from '../api/client'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

export default function UsersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const placeholder = new URL('/vite.svg', import.meta.env.BASE_URL).href

  async function load() {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/public/users', { params: { month } })
      setList(data.users || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load users')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [month])

  async function openDetail(u) {
    setSelected(u); setDetail(null)
    try {
      const { data } = await api.get(`/public/users/${u.id}`, { params: { month } })
      setDetail(data)
    } catch (e) {
      setDetail({ error: e?.response?.data?.error || 'Failed to load user' })
    }
  }
  function closeDetail() { setSelected(null); setDetail(null) }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{marginTop:0}}>Users</h2>
        <label className="label">Month</label>
        <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} />
      </div>
      <div className="grid cols-3" style={{marginTop:16}}>
        {loading && <div className="card"><p>Loading…</p></div>}
        {error && <div className="card" style={{color:'crimson'}}>{error}</div>}
        {!loading && !error && list.length === 0 && (
          <div className="card"><p>No users yet.</p></div>
        )}
        {list.map(u => (
          <div key={u.id} className="card" style={{cursor:'pointer'}} onClick={()=>openDetail(u)}>
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <img src={u.photoUrl||placeholder} alt="" style={{width:48,height:48,borderRadius:12,objectFit:'cover'}} />
              <div>
                <div style={{fontWeight:800}}>{u.name}</div>
                <div style={{opacity:.8,fontSize:12}}>{u.email}</div>
              </div>
            </div>
            <p style={{marginTop:8}}>
              <span className="badge">Meals: {u.totalMeals}</span>
              <span className="badge">Spent: {Math.round(u.totalCost)}</span>
              <span className="badge">Balance: {u.balance}</span>
            </p>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={closeDetail} title={selected ? selected.name : 'User'}>
        {detail ? (detail.error ? <p style={{color:'crimson'}}>{detail.error}</p> : (
          <div className="grid">
            <div className="card">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <img src={detail.user.photoUrl||placeholder} style={{width:60,height:60,borderRadius:12,objectFit:'cover'}} />
                <div>
                  <div style={{fontWeight:900}}>{detail.user.name}</div>
                  <div style={{opacity:.8,fontSize:12}}>{detail.user.email} • {detail.user.phone||'-'}</div>
                </div>
              </div>
              <p style={{marginTop:8}}>
                <span className="badge">Meals: {detail.totalMeals}</span>
                <span className="badge">Spent: {Math.round(detail.totalCost)}</span>
                <span className="badge">Balance: {detail.user.balance}</span>
              </p>
            </div>
            <div className="card">
              <label className="label">Month</label>
              <input className="input" type="month" value={month} onChange={async e=>{ setMonth(e.target.value); const { data } = await api.get(`/public/users/${detail.user.id||selected.id}`, { params: { month: e.target.value } }); setDetail(data) }} />
              <div className="scroll-x" style={{marginTop:8}}>
                <table className="table wide">
                  <thead><tr><th>Date</th><th>Breakfast</th><th>Dinner</th></tr></thead>
                  <tbody>
                    {detail.logs.map(l => (
                      <tr key={l._id||l.date}>
                        <td>{l.date}</td>
                        <td>{l.breakfast ? '✓' : '—'}</td>
                        <td>{l.dinner ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {isAdmin && (
              <div className="card">
                <p>Admin can edit this user in Admin → Users.</p>
              </div>
            )}
          </div>
        ) : (<p>Loading…</p>)}
      </Modal>
    </div>
  )
}