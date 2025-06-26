'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

const NavigationBarSetup = () => {
  useEffect(() => {
    const setupNavigationBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Set navigation bar color (Android only)
          await StatusBar.setBackgroundColor({
            color: '#121214'
          })
          
          // Set navigation bar style
          await StatusBar.setStyle({
            style: Style.Dark
          })
        } catch (error) {
          console.error('Error setting up navigation bar:', error)
        }
      }
    }

    setupNavigationBar()
  }, [])

  return null
}

export default NavigationBarSetup