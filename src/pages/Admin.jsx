import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../api/client'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement
} from 'chart.js'
import { FiBarChart2, FiSearch } from 'react-icons/fi'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement)

export default function Admin() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [rows, setRows] = useState([])
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
              <option value="perMeal">Per meal</option>
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
        <div className="grid cols-4">
          <div>
            <label className="label">Search</label>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <FiSearch style={{opacity:.7}} />
              <input className="input" placeholder="name or email" value={q} onChange={e=>setQ(e.target.value)} />
            </div>
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

        <div className="grid cols-2" style={{marginTop:12}}>
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

      <div className="card" style={{marginTop:16}}>
        <table className="table">
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
  )
}
