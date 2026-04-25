import * as Speech from 'expo-speech';

// Mocked Gemini Live service logic
export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private isConnected = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  connect() {
    console.log('Connecting to Gemini 2.5 Flash Live...');

    if (!this.apiKey) {
      console.error('Gemini API Key missing');
      return;
    }

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to Gemini Live WSS');
      this.isConnected = true;
      // Send initial setup frame
      this.ws?.send(JSON.stringify({
        setup: {
          model: "models/gemini-2.5-flash"
        }
      }));
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        // Process model turn parts
        if (response.serverContent?.modelTurn?.parts) {
          for (const part of response.serverContent.modelTurn.parts) {
            if (part.text) {
              this.handleResponse(part.text);
            }
          }
        }
      } catch(e) {
        console.error('Error parsing Gemini message:', e);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Gemini WSS Error:', error);
    };

    this.ws.onclose = () => {
      console.log('Gemini WSS Closed');
      this.isConnected = false;
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendFrame(base64Jpeg: string) {
    if (!this.isConnected || !this.ws) return;

    const message = JSON.stringify({
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'image/jpeg',
          data: base64Jpeg
        }]
      }
    });

    this.ws.send(message);
  }

  sendAudio(base64Audio: string) {
      if (!this.isConnected || !this.ws) return;
      const message = JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/pcm',
            data: base64Audio
          }]
        }
      });
      this.ws.send(message);
  }

  handleResponse(text: string) {
    console.log('Gemini says:', text);
    Speech.speak(text, {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
    });
  }
}
