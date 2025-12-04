import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Thêm dòng này

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(), // 2. Thêm dòng này vào danh sách plugins
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Backend chạy ở port này
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Xóa chữ /api trước khi gửi sang backend
      },
    },
  },
})