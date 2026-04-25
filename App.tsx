import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CameraView } from './src/components/CameraView';
import { WhisperService } from './src/services/whisperService';
import { GeminiLiveService } from './src/services/geminiLive';
import { SosService } from './src/services/sosService';
import { NavigationService, USF_MUMA_ROUTE } from './src/services/navigationService';

export default function App() {
  const [transcription, setTranscription] = useState('');
  const [whisperService] = useState(() => new WhisperService());
  const [geminiService] = useState(() => new GeminiLiveService(process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''));
  const [sosService] = useState(() => new SosService());
  const [navigationService] = useState(() => new NavigationService());

  // Demo State
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(1);
  const [currentLocation, setCurrentLocation] = useState(USF_MUMA_ROUTE[0]);

  useEffect(() => {
    geminiService.connect();
    navigationService.init(); // Request permissions

    whisperService.init().then(() => {
      whisperService.startRealtimeTranscription((text) => {
        setTranscription(text);
      });
    });

    return () => {
      geminiService.disconnect();
      navigationService.stopNavigation();
    };
  }, []);

  const toggleDemo = () => {
    if (isDemoRunning) {
      navigationService.stopNavigation();
      setIsDemoRunning(false);
    } else {
      setIsDemoRunning(true);
      navigationService.startDemoNavigation(demoSpeed, (loc) => {
        setCurrentLocation(loc);
      });
    }
  };

  const cycleSpeed = () => {
    const nextSpeed = demoSpeed === 1 ? 3 : demoSpeed === 3 ? 5 : 1;
    setDemoSpeed(nextSpeed);

    // If demo is running, restart it with new speed
    if (isDemoRunning) {
      navigationService.stopNavigation();
      navigationService.startDemoNavigation(nextSpeed, (loc) => {
        setCurrentLocation(loc);
      }, true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top half: Map Demo */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 28.0595,
            longitude: -82.4138,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Polyline
            coordinates={USF_MUMA_ROUTE}
            strokeColor="#000"
            strokeWidth={4}
          />
          <Marker
            coordinate={currentLocation}
            title="User Location"
            pinColor="blue"
          />
        </MapView>

        <View style={styles.demoControls}>
          <TouchableOpacity style={styles.demoButton} onPress={toggleDemo}>
            <Text style={styles.demoButtonText}>{isDemoRunning ? 'Stop Demo' : 'Start Demo'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.speedButton} onPress={cycleSpeed}>
            <Text style={styles.demoButtonText}>{demoSpeed}x</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom half: Camera & UI Overlay */}
      <View style={styles.cameraContainer}>
         <CameraView geminiService={geminiService} />

         <View style={styles.overlayControls}>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => sosService.triggerSos()}
              accessibilityLabel="SOS Emergency Button"
              accessibilityRole="button"
            >
              <Text style={styles.sosText}>SOS</Text>
            </TouchableOpacity>
         </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.transcriptionText}>{transcription || 'Listening...'}</Text>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapContainer: {
    flex: 1,
    borderBottomWidth: 2,
    borderColor: '#333',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  demoControls: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 10,
  },
  demoButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  speedButton: {
    backgroundColor: 'rgba(0,122,255,0.7)',
    padding: 10,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  demoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 20,
  },
  sosButton: {
    backgroundColor: 'red',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  sosText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
  },
  textContainer: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    minHeight: 120,
    justifyContent: 'center',
  },
  transcriptionText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
