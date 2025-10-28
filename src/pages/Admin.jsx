import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../api/client'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement
} from 'chart.js'
import { FiBarChart2, FiSearch } from 'react-icons/fi'
import Modal from '../components/Modal'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement)

export default function Admin() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [rows, setRows] = useState([])
  const [users, setUsers] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [editMealsUser, setEditMealsUser] = useState(null)
  const [editMealsMonth, setEditMealsMonth] = useState(dayjs().format('YYYY-MM'))
  const [editMealsLogs, setEditMealsLogs] = useState([])
  const [mealCost, setMealCost] = useState('')
  const [countingRule, setCountingRule] = useState('bothEqualsOne')
  const [q, setQ] = useState('')
  const [sortBy, setSortBy] = useState('spent') // meals|spent|balance
  const [topN, setTopN] = useState(10)

  async function load() {
    const { data } = await api.get('/admin/overview', { params: { month } })
    setRows(data.users)
    setMealCost(data.settings.mealCost)
    setCountingRule(data.settings.countingRule)
  }

  useEffect(() => { load() }, [month])

  async function saveSettings() {
    await api.patch('/admin/settings', { mealCost: Number(mealCost), countingRule })
    load()
  }

  async function loadUsers() {
    const { data } = await api.get('/admin/users')
    setUsers(data)
  }

  useEffect(() => { loadUsers() }, [])

  function openEditUser(u) { setEditUser({ ...u }) }
  function closeEditUser() { setEditUser(null) }
  async function saveUser() {
    await api.patch(`/admin/users/${editUser._id || editUser.id}`, {
      name: editUser.name, email: editUser.email, role: editUser.role, balance: editUser.balance, phone: editUser.phone, photoUrl: editUser.photoUrl
    })
    closeEditUser(); loadUsers()
  }
  async function deleteUser(id) {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    loadUsers()
  }

  async function openMealsEditor(u) {
    setEditMealsUser(u)
    await loadMeals(u._id || u.id, editMealsMonth)
  }
  function closeMealsEditor() { setEditMealsUser(null); setEditMealsLogs([]) }
  async function loadMeals(userId, m) {
    const { data } = await api.get('/admin/meals', { params: { userId, month: m } })
    setEditMealsLogs(data.logs || [])
  }
  async function toggleMeal(userId, date, key, value) {
    await api.post('/admin/meals/upsert', { userId, date, [key]: value })
    await loadMeals(userId, editMealsMonth)
  }

  function downloadPDF() {
    const url = `${import.meta.env.VITE_API_URL}/api/admin/pdf?month=${month}`
    window.open(url, '_blank')
  }

  const filtered = useMemo(() => {
    const by = sortBy
    const f = rows.filter(r => (r.name + ' ' + r.email).toLowerCase().includes(q.toLowerCase()))
    f.sort((a,b) => {
      const map = { meals: 'totalMeals', spent: 'totalCost', balance: 'balance' }
      const k = map[by]
      return (b[k] || 0) - (a[k] || 0)
    })
    return f.slice(0, topN)
  }, [rows, q, sortBy, topN])

  const labels = filtered.map(r => r.name)
  const mealsData = filtered.map(r => r.totalMeals)
  const spentData = filtered.map(r => Math.round(r.totalCost))
  const balanceData = filtered.map(r => Math.round(r.balance))

  const barOpts = { responsive: true, plugins: { legend: { display: true } } }
  const barMeals = { labels, datasets: [{ label: 'Meals', data: mealsData, backgroundColor: '#0F766E' }] }
  const barSpent = { labels, datasets: [{ label: 'Spent (৳)', data: spentData, backgroundColor: '#B77466' }] }
  const doughnutShare = {
    labels,
    datasets: [{ data: spentData, backgroundColor: labels.map((_,i)=>`hsl(${(i*37)%360} 70% 65%)`) }]
  }

  return (
    <div className="container">
      <div className="card glass">
        <h2>Admin Overview</h2>
        <div className="grid cols-4">
          <div>
            <label className="label">Month</label>
            <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} />
          </div>
          <div>
            <label className="label">Meal Cost</label>
            <input className="input" type="number" value={mealCost} onChange={e=>setMealCost(e.target.value)} />
          </div>
          <div>
            <label className="label">Counting Rule</label>
            <select className="input" value={countingRule} onChange={e=>setCountingRule(e.target.value)}>
              <option value="bothEqualsOne">Both meals = 1</option>
              <option value="anyMealIsOne">Any meal = 1</option>
              <option value="perMeal">Per meal (1.0 each)</option>
              <option value="perMealHalf">Per meal (0.5 each)</option>
            </select>
          </div>
          <div style={{display:'flex', alignItems:'end', gap:8}}>
            <button className="btn" onClick={saveSettings}>Save</button>
            <button className="btn" onClick={downloadPDF}>PDF</button>
          </div>
        </div>
      </div>

      <div className="card glass" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}><FiBarChart2 /> Analytics</h3>
      <div className="card glass" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}>Analytics</h3>
        <div className="grid cols-4">
          <div>
            <label className="label">Search</label>
            <input className="input" placeholder="name or email" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div>
            <label className="label">Sort By</label>
            <select className="input" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="spent">Spent</option>
              <option value="meals">Meals</option>
              <option value="balance">Balance</option>
            </select>
          </div>
          <div>
            <label className="label">Top N</label>
            <input className="input" type="number" min="1" max="50" value={topN} onChange={e=>setTopN(parseInt(e.target.value||'1',10))} />
          </div>
        </div>

        <div className="scroll-x" style={{marginTop:12}}>
          <div className="grid cols-2" style={{minWidth: 640}}>
            <div className="card" style={{padding:12}}>
              <h4 style={{margin:'6px 0'}}>Meals by User</h4>
              {filtered.length ? <Bar options={barOpts} data={barMeals} /> : <em>No data</em>}
            </div>
            <div className="card" style={{padding:12}}>
              <h4 style={{margin:'6px 0'}}>Spend by User</h4>
              {filtered.length ? <Bar options={barOpts} data={barSpent} /> : <em>No data</em>}
            </div>
            <div className="card" style={{padding:12}}>
              <h4 style={{margin:'6px 0'}}>Spend Share</h4>
              {filtered.length ? <Doughnut data={doughnutShare} /> : <em>No data</em>}
            </div>
            <div className="card" style={{padding:12}}>
              <h4 style={{margin:'6px 0'}}>Leaderboard</h4>
              <ol style={{margin:0, paddingLeft:18}}>
                {filtered.map((r,i)=> (
                  <li key={r.id} style={{marginBottom:6}}>{r.name} — ৳{Math.round(r.totalCost)} • {r.totalMeals} meals</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:16}}>
        <h3 style={{marginTop:0}}>Users</h3>
        <div className="grid cols-2">
          <div>
            <div className="scroll-x">
              <table className="table wide">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id || u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.balance}</td>
                      <td>
                        <button className="btn" onClick={()=>openEditUser(u)}>Edit</button>
                        <span style={{margin:'0 6px'}} />
                        <button className="btn teal" onClick={()=>openMealsEditor(u)}>Meals</button>
                        <span style={{margin:'0 6px'}} />
                        <button className="btn" onClick={()=>deleteUser(u._id || u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="scroll-x" style={{marginTop:16}}>
          <table className="table wide">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Meals</th>
                <th>Meal Cost</th>
                <th>Spent</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.totalMeals}</td>
                  <td>{r.mealCost}</td>
                  <td>{r.totalCost}</td>
                  <td>{r.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <Modal open={!!editUser} onClose={closeEditUser} title="Edit User"
        footer={<>
          <button className="btn" onClick={closeEditUser}>Cancel</button>
          <button className="btn teal" onClick={saveUser}>Save</button>
        </>}>
        {editUser && (
          <div className="grid">
            <label className="label">Name</label>
            <input className="input" value={editUser.name||''} onChange={e=>setEditUser({...editUser, name:e.target.value})} />
            <label className="label">Email</label>
            <input className="input" value={editUser.email||''} onChange={e=>setEditUser({...editUser, email:e.target.value})} />
            <label className="label">Role</label>
            <select className="input" value={editUser.role||'user'} onChange={e=>setEditUser({...editUser, role:e.target.value})}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <label className="label">Balance</label>
            <input className="input" type="number" value={editUser.balance||0} onChange={e=>setEditUser({...editUser, balance:Number(e.target.value)})} />
            <label className="label">Phone</label>
            <input className="input" value={editUser.phone||''} onChange={e=>setEditUser({...editUser, phone:e.target.value})} />
            <label className="label">Photo URL</label>
            <input className="input" value={editUser.photoUrl||''} onChange={e=>setEditUser({...editUser, photoUrl:e.target.value})} />
          </div>
        )}
      </Modal>

      <Modal open={!!editMealsUser} onClose={closeMealsEditor} title={editMealsUser ? `Meals: ${editMealsUser.name}` : 'Meals'}>
        {editMealsUser && (
          <div className="grid">
            <label className="label">Month</label>
            <input className="input" type="month" value={editMealsMonth} onChange={async e=>{ setEditMealsMonth(e.target.value); await loadMeals(editMealsUser._id||editMealsUser.id, e.target.value) }} />
            <div className="scroll-x">
              <table className="table wide">
                <thead>
                  <tr><th>Date</th><th>Breakfast</th><th>Dinner</th></tr>
                </thead>
                <tbody>
                  {editMealsLogs.map(l => (
                    <tr key={l._id || l.date}>
                      <td>{l.date}</td>
                      <td>
                        <input type="checkbox" checked={!!l.breakfast} onChange={e=>toggleMeal(editMealsUser._id||editMealsUser.id, l.date, 'breakfast', e.target.checked)} />
                      </td>
                      <td>
                        <input type="checkbox" checked={!!l.dinner} onChange={e=>toggleMeal(editMealsUser._id||editMealsUser.id, l.date, 'dinner', e.target.checked)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
