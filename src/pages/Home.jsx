import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="container">
      <div className="card">
        <h1>Where bachelors bond over biryani and budgeting.</h1>
        <p>Track meals, manage expenses, and stay in sync with your messmates.</p>
        {!user && (
          <p>
            <a className="btn" href="/login">Login</a>
            <span style={{ margin: '0 8px' }} />
            <a className="btn" href="/register">Register</a>
          </p>
        )}
      </div>
    </div>
  )
}
