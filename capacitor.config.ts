import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fittrack.app',
  appName: 'FitTrack',
  webDir: 'dist',
  android: {
    backgroundColor: '#030712',
  },
  server: {
    androidScheme: 'https', // Required for localStorage on Android 12+
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#030712',
    },
  },
};

export default config;
