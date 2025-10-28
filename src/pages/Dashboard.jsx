import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function DayCell({ date, log, onChange }) {
  const [b, setB] = useState(!!log?.breakfast)
  const [d, setD] = useState(!!log?.dinner)
  useEffect(() => { setB(!!log?.breakfast); setD(!!log?.dinner) }, [log])
  async function save(next) {
    await onChange(date, next)
  }
  return (
    <div className="day">
      <h4>{dayjs(date).format('D ddd')}</h4>
      <div>
        <label><input type="checkbox" checked={b} onChange={e => { setB(e.target.checked); save({ breakfast: e.target.checked, dinner: d }) }} /> Breakfast</label>
      </div>
      <div>
        <label><input type="checkbox" checked={d} onChange={e => { setD(e.target.checked); save({ breakfast: b, dinner: e.target.checked }) }} /> Dinner</label>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)

  const dates = useMemo(() => {
    const start = dayjs(month + '-01')
    const end = start.endOf('month')
    const arr = []
    for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) arr.push(d.format('YYYY-MM-DD'))
    return arr
  }, [month])

  useEffect(() => { (async () => {
    const { data } = await api.get('/meals/mine', { params: { month } })
    setLogs(data)
    const s = await api.get('/meals/summary/mine', { params: { month } })
    setSummary(s.data)
  })() }, [month])

  async function upsert(date, next) {
    const { data } = await api.post('/meals/mine', { date, ...next })
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === date)
      if (idx >= 0) { const p = [...prev]; p[idx] = data; return p }
      return [...prev, data]
    })
    const s = await api.get('/meals/summary/mine', { params: { month } })
    setSummary(s.data)
  }

  function getLog(date) { return logs.find(l => l.date === date) }

  return (
    <div className="container">
      <div className="grid cols-2">
        <div className="card">
          <h2>Hello, {user?.name}</h2>
          <p className="badge">Balance: {user?.balance?.toFixed?.(2) ?? user?.balance}</p>
          {summary && (
            <p>
              <span className="badge">Month: {summary.month}</span>
              <span className="badge">Meals: {summary.totalMeals}</span>
              <span className="badge">Meal Cost: {summary.mealCost}</span>
              <span className="badge">Spent: {summary.totalCost}</span>
            </p>
          )}
          <label className="label">Month</label>
          <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} />
        </div>
        <div className="card">
          <h3>Profile</h3>
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
          <p>Phone: {user?.phone || '-'}</p>
        </div>
      </div>
      <div className="card" style={{marginTop:16}}>
        <h3>Meals</h3>
        <div className="calendar">
          {dates.map(d => (
            <DayCell key={d} date={d} log={getLog(d)} onChange={(date, next) => upsert(date, next)} />
          ))}
        </div>
      </div>
    </div>
  )
}
