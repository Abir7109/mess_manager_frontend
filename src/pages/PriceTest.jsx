import { useState } from 'react'
import dayjs from 'dayjs'
import MealPriceChart from '../components/MealPriceChart'

export default function PriceTest() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  return (
    <div className="container">
      <div className="card" style={{maxWidth:800, margin:'20px auto'}}>
        <h2 style={{marginTop:0}}>Meal Price Graph Tester</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <label className="label">Month</label>
          <input className="input" type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{maxWidth:180}} />
        </div>
        <div style={{marginTop:12}}>
          <MealPriceChart month={month} />
        </div>
      </div>
    </div>
  )
}