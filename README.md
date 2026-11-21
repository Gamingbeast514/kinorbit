# KinOrbit — Live Family & Crew Safety Radar

**KinOrbit** is an original React Native (Expo + TypeScript) live location, geofence zone, and safety telemetry app designed with a **Midnight Slate & Aurora Mint** UI.

## Core Features
- **Radar (Live Map)**: Dark-styled interactive map (`react-native-maps`) with concentric Orbit member markers, live GPS tracking (`expo-location`), battery telemetry (`expo-battery`), and horizontal snap-scrollable member telemetry cards.
- **Zones (Geofencing)**: Create custom perimeter zones (150m – 1km) at your current location with arrival/departure alert toggles and live distance-to-zone status.
- **Shield (Safety & Drive Telemetry)**: 3-second countdown SOS Beacon with haptic feedback (`expo-haptics`), Ghost Mode (pause location sharing), live speed/battery/zone readout, and drive safety trip history.
- **Hub (Check-Ins & Contacts)**: Real-time Orbit activity timeline, custom status check-ins, Orbit invite code switcher/creator/joiner, and Emergency Contacts manager with local persistence (`AsyncStorage`).

## Getting Started

```bash
npm install
npx expo start
```

- Press `a` to open on Android emulator / connected device
- Press `i` to open on iOS simulator
- Or scan the QR code with **Expo Go**

## Android / Play Store Configuration
Configured in `app.json` under `com.kinorbit.app` with foreground and background location permissions (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`).
