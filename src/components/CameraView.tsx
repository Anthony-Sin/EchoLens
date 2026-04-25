import { useState, useEffect } from 'react';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import * as Haptics from 'expo-haptics';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { GeminiLiveService } from '../services/geminiLive';

export function CameraView({ geminiService }: { geminiService?: GeminiLiveService }) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const lastHapticTime = useSharedValue(0);
  const lastFrameTime = useSharedValue(0);

  const modelPlugin = useTensorflowModel(
    require('../../assets/models/object_detection.tflite'),
    (Platform.OS === 'ios' ? 'core-ml' : 'default') as any
  );

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const triggerHapticFeedback = Worklets.createRunOnJS(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  });

  const sendFrameToGemini = Worklets.createRunOnJS((base64: string) => {
    if (geminiService) {
      geminiService.sendFrame(base64);
    }
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!modelPlugin.model) return;

    try {
      const now = Date.now();

      // Send frame to Gemini at 1 FPS
      if (now - lastFrameTime.value > 1000) {
        lastFrameTime.value = now;
        const mockBase64 = "MOCK_BASE64_FRAME_DATA";
        sendFrameToGemini(mockBase64);
      }

      // Mock processing - if TFLite detects close hazard
      if (now - lastHapticTime.value > 1000) {
        lastHapticTime.value = now;
        // Trigger haptic if something is close
        // triggerHapticFeedback();
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
