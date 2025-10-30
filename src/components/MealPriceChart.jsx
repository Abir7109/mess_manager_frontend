import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import api from '../api/client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

export default function MealPriceChart({ month, refresh = 0 }) {
  const [labels, setLabels] = useState([])
  const [values, setValues] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/public/meal-price-history', { params: { month } })
        setLabels(data.labels || [])
        setValues(data.values || [])
      } catch (e) {
        setLabels([]); setValues([])
      }
    })()
  }, [month, refresh])

  const data = {
    labels,
    datasets: [
      {
        label: 'Meal Price (৳)',
        data: values,
        fill: true,
        backgroundColor: 'rgba(15,118,110,0.12)',
        borderColor: '#0F766E',
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.2,
      }
    ]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: true, labels: { boxWidth: 12 } }, tooltip: { enabled: true } },
    scales: {
      x: { grid: { display: true, color: 'rgba(255,255,255,0.08)' }, ticks: { autoSkip: true, maxTicksLimit: 10 } },
      y: { beginAtZero: true, grid: { display: true, color: 'rgba(255,255,255,0.12)' } }
    }
  }

  return (
    <div className="scroll-x">
      <div className="chart-wrap" style={{ minWidth: 320, width: '100%', height: 260 }}>
        <Line options={options} data={data} />
      </div>
    </div>
  )
}