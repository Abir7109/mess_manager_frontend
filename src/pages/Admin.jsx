import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import api from '../api/client'

export default function Admin() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [rows, setRows] = useState([])
  const [mealCost, setMealCost] = useState('')
  const [countingRule, setCountingRule] = useState('bothEqualsOne')

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

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Overview</h2>
        <div className="grid cols-3">
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
        </div>
        <div style={{marginTop:12}}>
          <button className="btn" onClick={saveSettings}>Save Settings</button>
          <span style={{margin:'0 8px'}} />
          <button className="btn" onClick={downloadPDF}>Download PDF</button>
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
