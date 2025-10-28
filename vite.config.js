import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Auto-detect repo name on GitHub Actions to set correct asset base
const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : ''
const isGH = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  plugins: [react()],
  base: isGH && repo ? `/${repo}/` : '/',
})
