'use client'

import { useEffect } from 'react'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarSetup() {
  useEffect(() => {
    const setupStatusBar = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: '#121214' }) 
        await StatusBar.setStyle({ style: Style.Light }) 
        await StatusBar.setOverlaysWebView({ overlay: false })
      } catch (error) {
        console.log('StatusBar setup failed or not supported in web:', error)
      }
    }

    setupStatusBar()
  }, [])

  return null     
}
