import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import api from '../api/client'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import viteLogo from '/vite.svg'

export default function UsersPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const placeholder = viteLogo
  const [adminEdit, setAdminEdit] = useState(null)
  const [adminMealsMonth, setAdminMealsMonth] = useState(dayjs().format('YYYY-MM'))
  const [adminMealsLogs, setAdminMealsLogs] = useState([])

  async function load() {
    setLoading(true); setError('')
    try {
      const { data } = await api.get('/public/users', { params: { month } })
      setList(data.users || [])
    } catch (e) {
      // Fallback: if public endpoint not available, try admin overview (requires auth)
      if (e?.response?.status === 404) {
        try {
          const { data } = await api.get('/admin/overview', { params: { month } })
          setList((data.users || []).map(u => ({ id: u.id || u._id, name: u.name, email: u.email, phone: u.phone, photoUrl: u.photoUrl, balance: u.balance, totalMeals: u.totalMeals, totalCost: u.totalCost })))
        } catch (err2) {
          setError(err2?.response?.data?.error || 'Failed to load users')
        }
      } else {
        setError(e?.response?.data?.error || 'Failed to load users')
      }
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [month])

  async function openDetail(u) {
    setSelected(u)
    // show basic info immediately
    setDetail({ month, user: { id: u.id, name: u.name, email: u.email, phone: u.phone, photoUrl: u.photoUrl, balance: u.balance }, totalMeals: u.totalMeals||0, totalCost: u.totalCost||0, mealCost: 0, logs: [] })
    try {
      const { data } = await api.get(`/public/users/${u.id}`, { params: { month } })
      setDetail(data)
    } catch (e) {
      if (e?.response?.status === 404) {
        try {
          const { data } = await api.get('/admin/overview', { params: { month } })
          const found = (data.users||[]).find(x => (x.id||x._id) === u.id)
          if (found) setDetail({ month, user: { id: u.id, name: u.name, email: u.email, phone: u.phone, photoUrl: u.photoUrl, balance: u.balance }, totalMeals: found.totalMeals||0, totalCost: found.totalCost||0, mealCost: data.settings?.mealCost||0, logs: [] })
        } catch (err2) {
          // keep basic detail; optionally attach message
        }
      }
    }
  }
  function closeDetail() { setSelected(null); setDetail(null) }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{marginTop:0}}><span style={{display:'inline-flex',alignItems:'center',gap:8}}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05A6.5 6.5 0 0 1 20 19v.5h4V17c0-2.33-4.67-4-8-4z"/></svg> Users</span></h2>
        <p style={{opacity:.8, marginTop:4}}>Public directory of members and their monthly meal stats.</p>
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
              <img src={u.photoUrl ? (((api.defaults?.baseURL||'').replace(/\/api$/, '')) + (u.photoUrl.startsWith('/')? u.photoUrl : '/'+u.photoUrl)) : placeholder} alt="" style={{width:48,height:48,borderRadius:12,objectFit:'cover'}} />
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
        {!detail && <p>Loading…</p>}
        {detail && detail.error && <p style={{color:'crimson'}}>{detail.error}</p>}
        {detail && !detail.error && (
          <div className="grid">
            <div className="card">
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <img src={detail.user.photoUrl ? (((api.defaults?.baseURL||'').replace(/\/api$/, '')) + (detail.user.photoUrl.startsWith('/')? detail.user.photoUrl : '/'+detail.user.photoUrl)) : placeholder} style={{width:60,height:60,borderRadius:12,objectFit:'cover'}} />
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
                <h4 style={{marginTop:0}}>Admin actions</h4>
                <div className="grid">
                  <label className="label">Name</label>
                  <input className="input" value={adminEdit?.name ?? detail.user.name} onChange={e=>setAdminEdit({ ...(adminEdit||{}), name:e.target.value })} />
                  <label className="label">Email</label>
                  <input className="input" value={adminEdit?.email ?? detail.user.email} onChange={e=>setAdminEdit({ ...(adminEdit||{}), email:e.target.value })} />
                  <label className="label">Role</label>
                  <select className="input" value={adminEdit?.role ?? 'user'} onChange={e=>setAdminEdit({ ...(adminEdit||{}), role:e.target.value })}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <label className="label">Balance</label>
                  <input className="input" type="number" value={adminEdit?.balance ?? detail.user.balance} onChange={e=>setAdminEdit({ ...(adminEdit||{}), balance:Number(e.target.value) })} />
                  <label className="label">Upload Photo</label>
                  <input type="file" accept="image/*" onChange={async e=>{
                    const f=e.target.files?.[0]; if(!f) return;
                    const fd=new FormData(); fd.append('photo', f);
                    await api.post(`/admin/users/${detail.user.id}/photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' }})
                    // refresh detail
                    const { data } = await api.get(`/public/users/${detail.user.id}`, { params: { month } }).catch(()=>({data:null}))
                    if (data) setDetail(data)
                  }} />
                  <div>
                    <button className="btn teal" onClick={async ()=>{
                      const body = { name: adminEdit?.name ?? detail.user.name, email: adminEdit?.email ?? detail.user.email, role: adminEdit?.role ?? 'user', balance: adminEdit?.balance ?? detail.user.balance }
                      await api.patch(`/admin/users/${detail.user.id}`, body)
                      setAdminEdit(null)
                      // refresh summary list entry as well
                      await load()
                    }}>Save</button>
                  </div>
                </div>
                <div className="card" style={{marginTop:12}}>
                  <h4 style={{marginTop:0}}>Meals editor</h4>
                  <label className="label">Month</label>
                  <input className="input" type="month" value={adminMealsMonth} onChange={async e=>{ setAdminMealsMonth(e.target.value); const res = await api.get('/admin/meals', { params: { userId: detail.user.id, month: e.target.value } }); setAdminMealsLogs(res.data.logs||[]) }} />
                  <div className="scroll-x" style={{marginTop:8}}>
                    <table className="table wide">
                      <thead><tr><th>Date</th><th>Breakfast</th><th>Dinner</th></tr></thead>
                      <tbody>
                        {adminMealsLogs.map(l => (
                          <tr key={l._id||l.date}>
                            <td>{l.date}</td>
                            <td><input type="checkbox" checked={!!l.breakfast} onChange={async e=>{ await api.post('/admin/meals/upsert', { userId: detail.user.id, date: l.date, breakfast: e.target.checked, dinner: l.dinner }); const res = await api.get('/admin/meals', { params: { userId: detail.user.id, month: adminMealsMonth } }); setAdminMealsLogs(res.data.logs||[]) }} /></td>
                            <td><input type="checkbox" checked={!!l.dinner} onChange={async e=>{ await api.post('/admin/meals/upsert', { userId: detail.user.id, date: l.date, dinner: e.target.checked, breakfast: l.breakfast }); const res = await api.get('/admin/meals', { params: { userId: detail.user.id, month: adminMealsMonth } }); setAdminMealsLogs(res.data.logs||[]) }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
