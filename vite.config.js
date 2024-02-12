import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // You may need to add proxy configurations if your Electron app communicates with an API
            // Example:
            // '/api': 'http://localhost:3000'
        },
    }
});
