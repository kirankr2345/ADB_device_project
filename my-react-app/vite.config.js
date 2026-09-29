import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Capacitor's Android WebView serves the app from a local origin. The
// `crossorigin` attribute Vite adds to the built <script>/<link> tags makes
// the WebView fetch them in CORS mode, which blocks the stylesheet and leaves
// the app unstyled. Strip it from the generated index.html.
const stripCrossOrigin = () => ({
  name: 'strip-crossorigin',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(/\s+crossorigin(="[^"]*")?/g, '')
  },
})

const listen = {
  host: true,
  port: 4173,
  strictPort: true,
  allowedHosts: true,
  proxy: {
    '/account': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
}

export default defineConfig({
  // Relative base so assets resolve correctly inside the packaged APK
  // regardless of the scheme/origin the WebView uses.
  base: './',
  plugins: [react(), tailwindcss(), stripCrossOrigin()],
  server: listen,
  preview: listen,
})
