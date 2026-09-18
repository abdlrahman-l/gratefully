import { type FirebaseApp, initializeApp } from 'firebase/app'

type FirebaseWebConfig = {
  apiKey: string
  appId: string
  authDomain: string
  messagingSenderId: string
  projectId: string
  storageBucket: string
}

export class FirebaseConfigurationError extends Error {
  public constructor(message: string) {
    super(message)
    this.name = 'FirebaseConfigurationError'
  }
}

const firebaseConfig: FirebaseWebConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

let firebaseApp: FirebaseApp | undefined

function hasFirebaseConfiguration() {
  return Object.values(firebaseConfig).every(Boolean)
}

export function getFirebaseApp() {
  if (!hasFirebaseConfiguration()) {
    throw new FirebaseConfigurationError(
      'Firebase Cloud Messaging is not configured for this environment.'
    )
  }

  firebaseApp ??= initializeApp(firebaseConfig)
  return firebaseApp
}
