import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const loadedEnv = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {
    plugins: [react()],
    server: {
      host: "127.0.0.1",
      port: 8000
    },
    define: {
      'process.env': loadedEnv
    },
  };
});