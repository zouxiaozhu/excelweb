import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        server: {
        },
        define: {
            __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
            __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || 'Excel Web')
        }
    }
})