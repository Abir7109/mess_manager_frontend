import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Auto-detect repo name on GitHub Actions to set correct asset base
const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : ''
const isGH = process.env.GITHUB_ACTIONS === 'true'
const isCap = process.env.CAP_BUILD === '1'

export default defineConfig({
  plugins: [react()],
  // For Capacitor (mobile), must be '/' so assets resolve under capacitor://localhost
  base: isCap ? '/' : (isGH && repo ? `/${repo}/` : '/'),
})
