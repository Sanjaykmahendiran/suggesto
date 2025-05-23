import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suggesto.app',
  appName: 'suggesto',
  webDir: 'out',
 server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      // Handle back button behavior
      handleBackButton: true,
      // Exit app on back button from root
      exitAppOnBackButtonPressed: false
    }
  }
};

export default config;
