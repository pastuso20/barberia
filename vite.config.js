import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages project site
  // If deploying to https://pastuso20.github.io/barberia/, base must be '/barberia/'
  base: '/barberia/',
  plugins: [react()],
})
