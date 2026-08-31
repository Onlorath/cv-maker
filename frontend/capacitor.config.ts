import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.onlorath.cvmaker",
  appName: "CV Maker",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Keyboard: {
      resize: "body",
    },
  },
};

export default config;
