'use client'

import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

const NavigationBarSetup = () => {
  useEffect(() => {
    const setupNavigationBar = async () => {
      // Only run on Android native platform
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
        return
      }

      try {
        // Update theme-color meta tag for Android navigation bar
        let themeColorMeta = document.querySelector('meta[name="theme-color"]')
        
        if (themeColorMeta) {
          themeColorMeta.setAttribute('content', '#121214')
        } else {
          const newMeta = document.createElement('meta') as HTMLMetaElement
          newMeta.name = 'theme-color'
          newMeta.content = '#121214'
          document.head.appendChild(newMeta)
        }

        // Set CSS custom property for safe area (already in your CSS)
        document.documentElement.style.setProperty('--navigation-bar-height', 'env(safe-area-inset-bottom)')

        console.log('NavigationBar setup completed successfully')
      } catch (error) {
        console.error('NavigationBar setup failed:', error)
      }
    }

    setupNavigationBar()
  }, [])

  return null
}

export default NavigationBarSetup