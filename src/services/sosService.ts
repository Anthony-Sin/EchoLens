import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { encode as btoa } from 'base-64';

export class SosService {
  async triggerSos() {
    console.log('SOS Triggered!');

    Speech.speak('SOS triggered. Sending location to emergency contact.');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      console.log(`Current location: ${latitude}, ${longitude}`);
      const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      const messageBody = `SOS Alert! I need help. My current location is: ${mapsLink}`;

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
         console.warn('Backend URL not configured. Simulating SOS SMS success.');
         Speech.speak('Emergency message sent successfully. (Simulated)');
         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
         return;
      }

      const response = await fetch(`${backendUrl}/api/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageBody })
      });

      if (response.ok) {
        console.log('SOS message sent successfully via backend.');
        Speech.speak('Emergency message sent successfully.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        console.error('Failed to send SOS via backend.');
        Speech.speak('Failed to send emergency message.');
      }

    } catch (error) {
      console.error('Error triggering SOS:', error);
      Speech.speak('Error getting location for SOS.');
    }
  }
}
