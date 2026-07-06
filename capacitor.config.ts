import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.roblox.sandbox',
  appName: 'Roblox Sandbox',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
