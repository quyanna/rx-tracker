'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { saveSubscription, deleteSubscription } from '@/app/notifications/actions'
import styles from './page.module.css'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export default function NotificationToggle() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => registration.pushManager.getSubscription())
      .then((existingSub) => {
        setStatus(existingSub ? 'subscribed' : 'unsubscribed')
      })
      .catch(() => setStatus('unsupported'))
  }, [])

  async function handleEnable() {
    setStatus('loading')
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })
      const result = await saveSubscription(JSON.stringify(subscription))
      if (result?.error) throw new Error(result.error)
      setStatus('subscribed')
    } catch (err) {
      console.error('Failed to enable notifications:', err)
      setStatus(Notification.permission === 'denied' ? 'denied' : 'unsubscribed')
    }
  }

  async function handleDisable() {
    setStatus('loading')
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        await deleteSubscription(endpoint)
      }
      setStatus('unsubscribed')
    } catch {
      setStatus('subscribed')
    }
  }

  if (status === 'loading') {
    return <button className={styles.notifyButton} disabled>...</button>
  }
  if (status === 'unsupported') return null
  if (status === 'denied') {
    return (
      <span className={styles.notifyDenied}>
        Notifications blocked — enable in browser settings
      </span>
    )
  }
  if (status === 'subscribed') {
    return (
      <button className={styles.notifyButtonOn} onClick={handleDisable}>
        <Bell size={14} strokeWidth={2} /> Notifications on
      </button>
    )
  }
  return (
    <button className={styles.notifyButton} onClick={handleEnable}>
      <BellOff size={14} strokeWidth={2} /> Enable notifications
    </button>
  )
}
