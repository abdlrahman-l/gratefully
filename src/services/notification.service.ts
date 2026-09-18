import { FirebaseConfigurationError, getFirebaseApp } from '@/services/firebase'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'

export type NotificationEnableErrorCode =
  | 'UNSUPPORTED'
  | 'DENIED'
  | 'CONFIGURATION'
  | 'SERVICE_WORKER'
  | 'TOKEN'

type NotificationEnableErrorOptions = {
  cause?: unknown
}

export class NotificationEnableError extends Error {
  public readonly cause?: unknown

  public constructor(
    public readonly code: NotificationEnableErrorCode,
    message: string,
    options?: NotificationEnableErrorOptions
  ) {
    super(message)
    this.name = 'NotificationEnableError'
    this.cause = options?.cause
  }
}

const FIREBASE_MESSAGING_SERVICE_WORKER = '/firebase-messaging-sw.js'

function hasBrowserNotificationSupport() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export async function isNotificationSupported() {
  if (!hasBrowserNotificationSupport()) return false

  try {
    return await isSupported()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[notifications] Unable to detect Firebase Messaging support.',
      error
    )
    return false
  }
}

export function getNotificationPermission():
  | NotificationPermission
  | 'unsupported' {
  return hasBrowserNotificationSupport()
    ? Notification.permission
    : 'unsupported'
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  const permission = getNotificationPermission()
  if (permission === 'unsupported' || permission === 'denied') return permission
  if (permission === 'granted') return permission

  return Notification.requestPermission()
}

async function getMessagingServiceWorkerRegistration() {
  try {
    return await navigator.serviceWorker.register(
      FIREBASE_MESSAGING_SERVICE_WORKER,
      { scope: '/', type: 'module' }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[notifications] Unable to register the FCM service worker.',
      error
    )
    throw new NotificationEnableError(
      'SERVICE_WORKER',
      'Unable to prepare notifications in this browser.',
      { cause: error }
    )
  }
}

export async function getFCMToken() {
  if (!(await isNotificationSupported())) {
    throw new NotificationEnableError(
      'UNSUPPORTED',
      'Notifications are not supported by this browser.'
    )
  }

  if (getNotificationPermission() !== 'granted') {
    throw new NotificationEnableError(
      'DENIED',
      'Notification permission has not been granted.'
    )
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    throw new NotificationEnableError(
      'CONFIGURATION',
      'Firebase Cloud Messaging is not configured for this environment.'
    )
  }

  try {
    const serviceWorkerRegistration =
      await getMessagingServiceWorkerRegistration()
    const messaging = getMessaging(getFirebaseApp())
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    })

    if (!token) {
      throw new Error('Firebase did not return a registration token.')
    }

    return token
  } catch (error) {
    if (error instanceof NotificationEnableError) throw error

    const code: NotificationEnableErrorCode =
      error instanceof FirebaseConfigurationError ? 'CONFIGURATION' : 'TOKEN'
    // eslint-disable-next-line no-console
    console.error(
      '[notifications] Unable to obtain an FCM registration token.',
      error
    )
    throw new NotificationEnableError(
      code,
      'Unable to enable notifications right now. Please try again later.',
      { cause: error }
    )
  }
}

export async function enableNotifications() {
  if (!(await isNotificationSupported())) {
    throw new NotificationEnableError(
      'UNSUPPORTED',
      'Notifications are not supported by this browser.'
    )
  }

  const permission = await requestNotificationPermission()
  if (permission === 'denied') {
    throw new NotificationEnableError(
      'DENIED',
      'Notifications are blocked in your browser settings.'
    )
  }
  if (permission !== 'granted') {
    throw new NotificationEnableError(
      'UNSUPPORTED',
      'Notifications are not supported by this browser.'
    )
  }

  return getFCMToken()
}
