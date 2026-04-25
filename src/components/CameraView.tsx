import { useState, useEffect, useRef } from 'react';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { StyleSheet, Text, View } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import * as Haptics from 'expo-haptics';
import { GeminiLiveService } from '../services/geminiLive';

export function CameraView({ geminiService }: { geminiService?: GeminiLiveService }) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const lastHapticTime = useRef(0);

  const modelPlugin = useTensorflowModel(
    require('../../assets/models/object_detection.tflite'),
    'core-ml' as any
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!modelPlugin.model) return;

    try {
      const now = Date.now();
      // Mock processing - if TFLite detects close hazard
      if (now - lastHapticTime.current > 1000) {
        lastHapticTime.current = now;
        // In a real app we'd process model outputs here
      }
    } catch (e) {
      console.log('Error processing frame:', e);
    }
  }, [modelPlugin.model]);

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No camera device found.</Text>
      </View>
    );
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    padding: 20,
  },
});
