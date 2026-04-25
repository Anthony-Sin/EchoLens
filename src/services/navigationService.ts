import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

// Hardcoded route near USF MUMA College of Business in Tampa
// Coordinates approximate: starting near Muma, walking towards the Library
export const USF_MUMA_ROUTE = [
  { latitude: 28.0585, longitude: -82.4131 }, // Start: Near Muma College
  { latitude: 28.0590, longitude: -82.4131, instruction: 'Continue straight' },
  { latitude: 28.0595, longitude: -82.4131, instruction: 'Turn left ahead', direction: 'left' }, // Approaching turn
  { latitude: 28.0595, longitude: -82.4135, instruction: 'Turn left' }, // The turn
  { latitude: 28.0595, longitude: -82.4140, instruction: 'Continue straight' },
  { latitude: 28.0595, longitude: -82.4145, instruction: 'Turn right ahead', direction: 'right' }, // Approaching turn
  { latitude: 28.0598, longitude: -82.4145, instruction: 'Turn right' }, // The turn
  { latitude: 28.0600, longitude: -82.4145, instruction: 'Arriving at destination' }, // End
];

export class NavigationService {
  private demoInterval: NodeJS.Timeout | null = null;
  private currentStepIndex = 0;

  async init() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return false;
    }
    return true;
  }

  startDemoNavigation(speedMultiplier: number, onLocationUpdate: (coord: {latitude: number, longitude: number}) => void, isRestart = false) {
    console.log(`Started demo navigation at ${speedMultiplier}x speed`);

    if (!isRestart) {
      Speech.speak('Starting demo navigation mode.', { rate: 0.9 });
      this.currentStepIndex = 0;
    }

    const intervalTime = 2000 / speedMultiplier; // Base time between steps is 2s

    this.demoInterval = setInterval(() => {
      if (this.currentStepIndex >= USF_MUMA_ROUTE.length) {
        this.stopNavigation();
        return;
      }

      const step = USF_MUMA_ROUTE[this.currentStepIndex];
      onLocationUpdate({ latitude: step.latitude, longitude: step.longitude });

      if (step.direction) {
        this.signalTurn(step.direction as 'left' | 'right');
      } else if (step.instruction) {
        Speech.speak(step.instruction, { rate: 0.9 });
      }

      this.currentStepIndex++;
    }, intervalTime);
  }

  stopNavigation() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
    Speech.speak('Navigation ended.');
  }

  private async signalTurn(direction: 'left' | 'right') {
    if (direction === 'left') {
        Speech.speak('Turn left ahead.', { rate: 0.9 });
        // Distinct haptic for left: 2 quick pulses
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 300);
    } else {
        Speech.speak('Turn right ahead.', { rate: 0.9 });
        // Distinct haptic for right: 3 quick pulses
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 200);
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 400);
    }
  }
}
