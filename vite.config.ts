/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { playwright } from '@vitest/browser-playwright'

const FIREBASE_SDK_VERSION = '12.19.0'

function firebaseMessagingServiceWorker(env: Record<string, string>): Plugin {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: env.VITE_FIREBASE_APP_ID ?? '',
  }
  const hasFirebaseConfiguration = Object.values(firebaseConfig).every(Boolean)
  const workerSource = `import { initializeApp } from 'https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js'
import { getMessaging, onBackgroundMessage } from 'https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging-sw.js'

const firebaseConfig = ${JSON.stringify(firebaseConfig)}

if (${hasFirebaseConfiguration}) {
  const messaging = getMessaging(initializeApp(firebaseConfig))

  onBackgroundMessage(messaging, (payload) => {
    const notification = payload.notification
    if (!notification) return

    void self.registration.showNotification(notification.title ?? 'Gratefully', {
      body: notification.body,
      icon: '/images/leaf-logo.svg',
      data: payload.data,
    })
  })
} else {
  console.error('[notifications] Firebase Cloud Messaging is not configured.')
}
`

  return {
    name: 'firebase-messaging-service-worker',
    configureServer(server) {
      server.middlewares.use(
        '/firebase-messaging-sw.js',
        (_request, response) => {
          response.setHeader('Content-Type', 'text/javascript')
          response.end(workerSource)
        }
      )
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'firebase-messaging-sw.js',
        source: workerSource,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      firebaseMessagingServiceWorker(env),
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      silent: 'passed-only',
      unstubEnvs: true,
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
      },
      coverage: {
        // include: ['src/**/*.{js,jsx,ts,tsx}'], // Uncomment to expand the report to all src/**/* so untested modules appear as 0% coverage.
        exclude: [
          'src/components/ui/**',
          'src/assets/**',
          'src/tanstack-table.d.ts',
          'src/routeTree.gen.ts',
          'src/test-utils/**',
          'src/routes/**',
        ],
      },
    },
  }
})
