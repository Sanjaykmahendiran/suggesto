import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suggesto.app',
  appName: 'Suggesto',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      // Handle back button behavior
      handleBackButton: true,
      // Exit app on back button from root
      exitAppOnBackButtonPressed: false,
      launchShowDuration: 0,
      SocialSharing: {
        enabled: true
      },
    }
  },
  cordova: {
    preferences: {
      LottieFullScreen: 'true',
      LottieHideAfterAnimationEnd: 'false',
      LottieAnimationLocation: 'splash',
      LottieAnimationLocationLight: 'splash',
      LottieAnimationLocationDark: 'splash',

      LottieBackgroundColor: '#ffffff',
      LottieBackgroundColorLight: '#ffffff',
      LottieBackgroundColorDark: '#ffffff',

      LottieEnableHardwareAcceleration: 'true',
      LottieFadeOutDuration: '500',

      LottieWidth: '650',
      LottieHeight: '650',

      // LottieScaleType: 'FIT_CENTER',
      // LottieRemoteEnabled: 'false',
      // LottieImagesLocation: 'public/assets/splash.json',
      // LottieCancelOnTap: '',
      // LottieHideTimeout: '',
      // LottieRelativeSize: '',
      LottieLoopAnimation: 'false',
      // LottieAutoHideSplashScreen: 'false',
      // LottieCacheDisabled: 'false',
    },
  },
};

export default config;
