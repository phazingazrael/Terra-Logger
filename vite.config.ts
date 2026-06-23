import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const KB = 1024;
const CHUNK_LIMIT = 250 * KB;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          minSize: 20 * KB,
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 100,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "mui-vendor",
              test: /node_modules[\\/]@mui[\\/]/,
              priority: 90,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "emotion-vendor",
              test: /node_modules[\\/]@emotion[\\/]/,
              priority: 85,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "zip-export-vendor",
              test: /node_modules[\\/](jszip|file-saver)[\\/]/,
              priority: 80,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "sanitize-vendor",
              test: /node_modules[\\/](dompurify)[\\/]/,
              priority: 75,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "utility-vendor",
              test: /node_modules[\\/](uuid|idb|localforage|lodash|lodash-es)[\\/]/,
              priority: 70,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 10,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "atlas",
              test: /src[\\/]atlas[\\/]/,
              priority: 60,
              minSize: 10 * KB,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "settings",
              test: /src[\\/]pages[\\/]Settings[\\/]/,
              priority: 55,
              minSize: 10 * KB,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "export",
              test: /src[\\/].*[\\/]export[\\/]|src[\\/]components[\\/].*[\\/]export[\\/]|src[\\/]Export[\\/]/i,
              priority: 50,
              minSize: 10 * KB,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "view-pages",
              test: /src[\\/]pages[\\/]ViewingPages[\\/]/,
              priority: 45,
              minSize: 10 * KB,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "list-pages",
              test: /src[\\/]pages[\\/](Cities|Countries|Cultures|Religions|Notes)/,
              priority: 40,
              minSize: 10 * KB,
              maxSize: CHUNK_LIMIT,
            },
            {
              name: "common",
              minShareCount: 2,
              minSize: 20 * KB,
              priority: 5,
              maxSize: CHUNK_LIMIT,
            },
          ],
        },
      },
    },
  },
});
