import dayjs from 'dayjs'
import { useEffect, useMemo, useState, memo } from 'react'
import { motion } from 'framer-motion'
import api from '../api/client'
import viteLogo from '/vite.svg'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import AnimatedNumber from '../components/AnimatedNumber'
import GraphBar from '../components/GraphBar'
import MealPriceChart from '../components/MealPriceChart'
import { LuSunrise, LuMoon } from 'react-icons/lu'

const DayCell = memo(function DayCell({ date, log, onChange, editable }) {
  const initialBQ = Number.isFinite(log?.breakfastQuarters) ? log.breakfastQuarters : (log?.breakfast ? 2 : 0)
  const initialDQ = Number.isFinite(log?.dinnerQuarters) ? log.dinnerQuarters : (log?.dinner ? 2 : 0)
  const [bq, setBQ] = useState(initialBQ)
  const [dq, setDQ] = useState(initialDQ)
  useEffect(() => {
    setBQ(Number.isFinite(log?.breakfastQuarters) ? log.breakfastQuarters : (log?.breakfast ? 2 : 0))
    setDQ(Number.isFinite(log?.dinnerQuarters) ? log.dinnerQuarters : (log?.dinner ? 2 : 0))
  }, [log])
  async function save(next) { if (editable) await onChange(date, next) }
  const cls = `day${bq>0 ? ' with-b' : ''}${dq>0 ? ' with-d' : ''}`
  return (
    <div className={cls}>
      <div className="hint">B { (bq*0.25).toFixed(2) } • D { (dq*0.25).toFixed(2) }</div>
      <h4>{dayjs(date).format('D ddd')}</h4>
      <div className="meal-toggles">
        <button
          className={`chip b ${bq>0 ? 'on' : 'off'}`}
          disabled={!editable || bq>=2}
          onClick={() => { if (!editable || bq>=2) return; const nbq = bq+1; setBQ(nbq); save({ breakfastQuarters: nbq, dinnerQuarters: dq }) }}>
          <LuSunrise /> <span className="txt">Breakfast +0.25</span>
        </button>
        <button
          className={`chip d ${dq>0 ? 'on' : 'off'}`}
          disabled={!editable || dq>=2}
          onClick={() => { if (!editable || dq>=2) return; const ndq = dq+1; setDQ(ndq); save({ breakfastQuarters: bq, dinnerQuarters: ndq }) }}>
          <LuMoon /> <span className="txt">Dinner +0.25</span>
        </button>
      </div>
    </div>
  )
})

export default function Dashboard() {
  const { user, updateProfile } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [openProfile, setOpenProfile] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', photoUrl: '' })
  const [sharedShare, setSharedShare] = useState(0)

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
    // Use backend-calculated shared share to avoid double counting
    setSharedShare(Number(s.data?.sharedShare || 0))
  })() }, [month, user])

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', photoUrl: user.photoUrl || '' })
  }, [user])

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

  const daysInMonth = dates.length
  const meals = summary?.totalMeals || 0
  const mealsSpent = summary?.mealsCost || 0
  const spent = mealsSpent
  const totalOut = (summary?.totalCost != null) ? summary.totalCost : (spent + (sharedShare || 0))

  return (
    <div className="container">
      <div className="grid cols-2">
        <motion.div className="card glass" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <h2 style={{ margin: 0 }}>Welcome, {user?.name}</h2>
              <p style={{ margin: '6px 0 12px', opacity:.85 }}>Here’s your month at a glance.</p>
            </div>
            <button className="btn teal pill" onClick={() => setOpenProfile(true)}>Edit Profile</button>
          </div>

          <div className="grid cols-3">
            <div className="card" style={{ padding:12 }}>
              <div className="label">Meals</div>
              <div style={{ fontSize:'1.8rem', fontWeight:800 }}><AnimatedNumber value={meals} /></div>
              <GraphBar value={meals} max={daysInMonth} />
            </div>
            <div className="card" style={{ padding:12 }}>
              <div className="label">Meals Spent</div>
              <div style={{ fontSize:'1.8rem', fontWeight:800 }}><AnimatedNumber value={Math.round(spent)} prefix="৳" /></div>
              <div className="badge">Meal Cost: {summary?.mealCost}</div>
            </div>
            <div className="card" style={{ padding:12 }}>
              <div className="label">Shared Expenses (My Share)</div>
              <div style={{ fontSize:'1.8rem', fontWeight:800 }}><AnimatedNumber value={Math.round(sharedShare)} prefix="৳" /></div>
              <GraphBar value={sharedShare} max={Math.max(sharedShare || 1, spent || 1)} />
            </div>
            <div className="card" style={{ padding:12 }}>
              <div className="label">Total Outflow</div>
              <div style={{ fontSize:'1.8rem', fontWeight:800 }}><AnimatedNumber value={Math.round(totalOut)} prefix="৳" /></div>
              <GraphBar value={totalOut} max={Math.max(totalOut || 1, (user?.balance||0) + totalOut)} />
            </div>
          </div>

          <div style={{ marginTop:12 }}>
            <label className="label">Month</label>
            <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} />
          </div>
        </motion.div>

        <motion.div className="card glass" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ marginTop:0 }}>Profile</h3>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>
            <img src={viteLogo} alt="" style={{width:60,height:60,borderRadius:12,objectFit:'cover'}} />
            <div>
              <p style={{margin:0}}><strong>{user?.name}</strong></p>
              <p style={{margin:0,opacity:.8}}>{user?.email}</p>
              <p style={{margin:0,opacity:.8}}>Phone: {user?.phone || '-'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div className="card glass" style={{marginTop:16}} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
          <h3 style={{margin:0}}>Meal Price — {dayjs(month+'-01').format('MMMM YYYY')}</h3>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <label className="label" style={{marginRight:6}}>Month</label>
            <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{maxWidth:160}} />
          </div>
        </div>
        <MealPriceChart month={month} />
      </motion.div>

      <motion.div className="card glass" style={{marginTop:16}} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3>Meals</h3>
        <div className="calendar-wrap">
          <div className="calendar">
          {dates.map(d => (
            <DayCell key={d} date={d} log={getLog(d)} editable={isAdmin || true} onChange={(date, next) => upsert(date, next)} />
          ))}
          </div>
        </div>
      </motion.div>

      <Modal open={openProfile} onClose={() => setOpenProfile(false)} title="Edit Profile"
        footer={
          <>
            <button className="btn" onClick={() => setOpenProfile(false)}>Cancel</button>
            <button className="btn teal" onClick={async () => { await updateProfile(form); setOpenProfile(false) }}>Save</button>
          </>
        }>
        <div className="grid">
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <label className="label">Photo URL</label>
          <input className="input" value={form.photoUrl} onChange={e => setForm(f => ({ ...f, photoUrl: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
