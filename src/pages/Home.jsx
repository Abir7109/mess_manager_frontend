import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { LuCalendarClock, LuWallet, LuIdCard, LuBarChart3, LuUsers, LuMoonStar } from 'react-icons/lu'

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="container" style={{paddingTop:24}}>
      <section className="hero">
        <div className="steam-wrap">
          <div className="steam s1" />
          <div className="steam s2" />
          <div className="steam s3" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1>Live smart. Eat together. Track everything.</h1>
          <p>Mess Manager is your lifestyle dashboard: meals, expenses, and community—beautifully organized.</p>
          <div className="actions">
            {!user ? (
              <>
                <a className="btn teal" href="/login">Get Started</a>
                <a className="btn" href="/register">Create Account</a>
              </>
            ) : (
              <a className="btn teal" href="/dashboard">Open Dashboard</a>
            )}
          </div>
        </motion.div>
      </section>

      <section style={{marginTop:24}}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="tiles">
            <article className="tile">
              <h3><LuCalendarClock /> Calendar Intelligence</h3>
              <p>Two meals count as one—auto-logged with a monthly summary.</p>
            </article>
            <article className="tile">
              <h3><LuWallet /> Balance Automation</h3>
              <p>Costs are deducted in real-time from your saved balance.</p>
            </article>
            <article className="tile">
              <h3><LuIdCard /> Profile Cards</h3>
              <p>Dynamic, editable user cards with meal history and contacts.</p>
            </article>
            <article className="tile">
              <h3><LuBarChart3 /> Admin & Analytics</h3>
              <p>Manage users, tweak meals, export branded PDFs, and view trends.</p>
            </article>
            <article className="tile">
              <h3><LuUsers /> Community</h3>
              <p>Meal voting and shared expense logs keep everyone in sync.</p>
            </article>
            <article className="tile">
              <h3><LuMoonStar /> Dark Mode</h3>
              <p>Charcoal-moss theme designed for late-night logging.</p>
            </article>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
