import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  /* ── Root directory: file ini ada di root project ── */
  root: '.',

  /* ── Public assets (favicon, manifest, dll) ── */
  publicDir: 'public',

  /* ── Development Server ── */
  server: {
    port: 3000,
    open: true,
    /* Host 0.0.0.0 agar bisa diakses dari device lain di jaringan lokal */
    host: '0.0.0.0',
    /* Strict port — gagal kalau port 3000 sudah dipakai, bukan auto-increment */
    strictPort: false
  },

  /* ── Preview server (untuk nge-test build result) ── */
  preview: {
    port: 4000,
    open: true,
    host: '0.0.0.0'
  },

  /* ── Build Configuration ── */
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    /* Source map untuk production debugging */
    sourcemap: false,

    /* Minify setting */
    minify: 'esbuild',

    /* Chunk size warning limit (500kb) */
    chunkSizeWarningLimit: 500,

    /* Target browser */
    target: 'es2020',

    /* CSS handling */
    cssMinify: true,

    /* Rollup options untuk Multi-Page Application */
    rollupOptions: {
      input: {
        /* Entry point utama (redirect ke login/home) */
        main: resolve(__dirname, 'index.html'),

        /* Auth pages */
        login: resolve(__dirname, 'pages/login.html'),
        register: resolve(__dirname, 'pages/register.html'),

        /* App pages */
        home: resolve(__dirname, 'pages/home.html'),
        product: resolve(__dirname, 'pages/product.html'),
        checkout: resolve(__dirname, 'pages/checkout.html'),
        success: resolve(__dirname, 'pages/order-success.html')
      },

      output: {
        /* Entry file naming */
        entryFileNames: 'assets/js/[name]-[hash].js',

        /* Chunk file naming (shared modules) */
        chunkFileNames: 'assets/js/chunk-[name]-[hash].js',

        /* Asset file naming (CSS, images, fonts) */
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';

          /* CSS files */
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }

          /* Images */
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]';
          }

          /* Fonts */
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }

          /* Fallback */
          return 'assets/[name]-[hash][extname]';
        },

        /* Manual chunk splitting untuk optimasi bundle */
        manualChunks(id) {
          const nodeModules = id.includes('node_modules');

          if (nodeModules) {
            /* Supabase SDK — chunk terpisah karena besar */
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }

            /* Semua node_modules lainnya masuk satu chunk */
            return 'vendor';
          }
        }
      }
    }
  },

  /* ── Path Aliases ── */
  resolve: {
    alias: {
      /*
       * Shortcut alias (opsional, bisa diaktifkan kalau mau)
       * Contoh penggunaan: import { foo } from '@/utils/currency.js'
       *
       * Kalau mau pakai, uncomment baris di bawah:
       */
      // '@': resolve(__dirname, 'src'),
      // '@js': resolve(__dirname, 'src/js'),
      // '@styles': resolve(__dirname, 'src/styles'),
      // '@assets': resolve(__dirname, 'src/assets'),
      // '@pages': resolve(__dirname, 'pages')
    },

    /* Pastikan extension .js bisa di-resolve tanpa menulisnya */
    extensions: ['.mjs', '.js', '.json']
  },

  /* ── CSS Configuration ── */
  css: {
    devSourcemap: true,
    preprocessorOptions: {}
  },

  /* ── JSON import support ── */
  json: {
    namedExports: true,
    stringify: false
  },

  /* ── Optimasi deps ── */
  optimizeDeps: {
    /* Force bundle deps ini saat dev, hindari loading delay */
    include: ['@supabase/supabase-js'],

    /* Exclude deps yang bermasalah (kalau ada) */
    exclude: []
  },

  /* ── Static asset handling ── */
  assetsInclude: [
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.webp',
    '**/*.avif',
    '**/*.ico',
    '**/*.woff',
    '**/*.woff2',
    '**/*.ttf',
    '**/*.eot'
  ],

  /* ── Base URL untuk asset paths ── */
  base: './',

  /* ── Plugin (kosong, tapi siap kalau butuh plugin tambahan) ── */
  plugins: []
});