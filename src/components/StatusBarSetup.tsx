'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

export default function StatusBarSetup() {
  useEffect(() => {
    const setupStatusBar = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        return
      }

      try {
        // Set status bar background color
        await StatusBar.setBackgroundColor({ 
          color: '#121214' 
        })

        // Set status bar style - Dark style shows light content (white icons/text)
        await StatusBar.setStyle({ 
          style: Style.Dark 
        })

        // Make sure status bar doesn't overlay the web view
        await StatusBar.setOverlaysWebView({ 
          overlay: false 
        })

        // Show the status bar if it's hidden
        await StatusBar.show()

        console.log('StatusBar setup completed successfully')
      } catch (error) {
        console.error('StatusBar setup failed:', error)
      }
    }

    setupStatusBar()
  }, [])

  return null
}