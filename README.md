# EchoLens

EchoLens is an accessibility tool for people with combined vision and hearing loss. It uses on-device ML segmentation, Gemini 2.5 Flash Live, and local speech-to-text (`whisper.rn`) to understand the scene and communicate entirely through haptic vibration patterns, text-to-speech, and large readable text.

## Features
- **On-Device Hazard Detection:** Uses `react-native-fast-tflite` for immediate haptic feedback.
- **Scene Understanding:** Integrates Gemini 2.5 Flash Live WSS to describe scenes via TTS.
- **Local Speech-to-Text:** Uses `whisper.rn` to display large, readable transcriptions of nearby speech.
- **Accessible Navigation:** Uses Google Maps via `react-native-maps` and `expo-location` with haptic/TTS turn-by-turn guidance.
- **SOS Emergency Alert:** Prominent SOS button that texts the user's location via a secure backend API.
- **Navigation Demo Mode:** Simulates a walk near the USF Muma College of Business with live map tracking and haptic/TTS cues.

## Setup Instructions

1. Clone the repository.
2. Run `npm install`
3. Since this uses native modules (`whisper.rn`, `react-native-fast-tflite`), you need to build a custom dev client.
4. Copy `.env.example` to `.env` and fill in your API keys:
   - `EXPO_PUBLIC_GEMINI_API_KEY=`
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=`
   - `EXPO_PUBLIC_TWILIO_ACCOUNT_SID=`
   - `EXPO_PUBLIC_TWILIO_AUTH_TOKEN=`
   - `EXPO_PUBLIC_TWILIO_PHONE_NUMBER=`
   - `EXPO_PUBLIC_EMERGENCY_CONTACT_NUMBER=`
   - `EXPO_PUBLIC_BACKEND_URL=`
5. Run `npx expo prebuild` and then `npm run ios` or `npm run android` to build and run the custom client.
