import { useState } from 'react'
import dayjs from 'dayjs'
import MealPriceChart from '../components/MealPriceChart'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PriceTest() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [value, setValue] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [refresh, setRefresh] = useState(0)
  const { user } = useAuth()

  async function applyChange() {
    setMsg(''); setErr('')
    try {
      await api.post('/admin/price-change', { value: Number(value), date })
      setMsg('Saved!');
      const m = date.slice(0,7); if (m !== month) setMonth(m);
      setRefresh(r=>r+1)
    } catch (e) {
      setErr(e?.response?.data?.error || 'Failed')
    }
  }

  function shiftDay(delta) {
    const next = dayjs(date).add(delta, 'day')
    setDate(next.format('YYYY-MM-DD'))
  }
  function shiftMonth(delta) {
    const next = dayjs(month + '-01').add(delta, 'month')
    setMonth(next.format('YYYY-MM'))
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:800, margin:'20px auto'}}>
        <h2 style={{marginTop:0}}>Meal Price Graph Tester</h2>
        <div className="grid cols-2">
          <div>
            <label className="label">Month</label>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button className="btn" onClick={()=>shiftMonth(-1)}>&lt;</button>
              <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{maxWidth:180}} />
              <button className="btn" onClick={()=>shiftMonth(1)}>&gt;</button>
            </div>
          </div>
          <div>
            <label className="label">Change price (admin only)</label>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr auto', gap:8}}>
              <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
              <input className="input" type="number" placeholder="meal price (৳)" value={value} onChange={e=>setValue(e.target.value)} />
              <button className="btn teal" onClick={applyChange} disabled={!user || user.role!=='admin'}>Apply</button>
            </div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="btn" onClick={()=>shiftDay(-1)}>-1 day</button>
              <button className="btn" onClick={()=>shiftDay(1)}>+1 day</button>
            </div>
            {!user && <p className="desc">Login as admin to apply changes.</p>}
            {err && <p style={{color:'crimson'}}>{err}</p>}
            {msg && <p style={{color:'seagreen'}}>{msg}</p>}
          </div>
        </div>
        <div style={{marginTop:12}}>
          <MealPriceChart month={month} refresh={refresh} />
        </div>
      </div>
    </div>
  )
}
