import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.abir.messmanager',
  appName: 'Mess Manager',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
