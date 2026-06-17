'use client'
import { useEffect } from 'react'

export default function UnregisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => {
          reg.unregister()
          console.log('SW unregistered:', reg.scope)
        })
      })
    }
  }, [])
  return null
}
