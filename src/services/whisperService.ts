import { initWhisper } from 'whisper.rn';
import * as FileSystem from 'react-native-fs';

export class WhisperService {
  private whisperContext: any = null;

  async init() {
    console.log('Initializing whisper.rn...');
    try {
      const modelUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
      const modelPath = `${FileSystem.DocumentDirectoryPath}/ggml-tiny.en.bin`;

      const fileExists = await FileSystem.exists(modelPath);

      if (!fileExists) {
        console.log('Downloading Whisper model...');
        await FileSystem.downloadFile({ fromUrl: modelUrl, toFile: modelPath }).promise;
      }

      this.whisperContext = await initWhisper({ filePath: modelPath });

      console.log('Whisper initialized successfully');
    } catch (e) {
      console.error('Error initializing whisper:', e);
    }
  }

  async transcribeAudio(audioPath: string): Promise<string> {
    if (!this.whisperContext) {
      console.warn('Whisper not initialized.');
      return 'Mock transcription: Hello, how can I help you today?';
    }

    try {
      const { promise } = this.whisperContext.transcribe(audioPath, {
        language: 'en',
        maxLen: 1,
        tokenTimestamps: true,
      });

      const result = await promise;
      return result.result;
    } catch (e) {
      console.error('Error transcribing audio:', e);
      return '';
    }
  }

  async startRealtimeTranscription(onTranscription: (text: string) => void) {
    if (!this.whisperContext) {
      console.warn('Whisper not initialized, simulating real-time transcription.');
      // Simulate real-time
      setInterval(() => {
        onTranscription('Mock transcription update at ' + new Date().toLocaleTimeString());
      }, 5000);
      return;
    }

    try {
      await this.whisperContext.transcribeRealtime({
        language: 'en',
        realtimeAudioSec: 60,
        realtimeAudioSliceSec: 5,
        onProgress: (progress: number) => {
          console.log(`Transcription progress: ${progress}%`);
        },
        onNewSegments: (result: any) => {
          onTranscription(result.result);
        },
      });
    } catch (e) {
      console.error('Error starting real-time transcription:', e);
    }
  }
}
