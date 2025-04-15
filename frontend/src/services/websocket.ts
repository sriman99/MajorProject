type MessageCallback = (message: { text: string; sender: "user" | "doctor" }) => void;
type ConnectionCallback = (status: 'connected' | 'disconnected' | 'error', message?: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private mockMode = true; // Set to false when real WebSocket server is ready
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect(doctorId: string, userId: string) {
    if (this.mockMode) {
      console.log('WebSocket running in mock mode');
      this.notifyConnectionStatus('connected');
      return;
    }

    try {
      // In production, use wss:// and your actual WebSocket server URL
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://your-production-ws-server.com';
      this.socket = new WebSocket(`${wsUrl}/chat?doctorId=${doctorId}&userId=${userId}`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus('connected');
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.messageCallbacks.forEach(callback => callback(message));
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.notifyConnectionStatus('disconnected');
        this.handleReconnection(doctorId, userId);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyConnectionStatus('error', 'Failed to connect to chat service');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.notifyConnectionStatus('error', 'Failed to initialize chat service');
    }
  }

  private handleReconnection(doctorId: string, userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(doctorId, userId), 3000);
    } else {
      this.notifyConnectionStatus('error', 'Could not reconnect to chat service');
    }
  }

  sendMessage(message: string) {
    if (this.mockMode) {
      // Simulate message sending and doctor's response
      this.messageCallbacks.forEach(callback => callback({ text: message, sender: "user" }));
      setTimeout(() => {
        const responses = [
          "I'll check your records and get back to you shortly.",
          "Thank you for your message. How can I help you today?",
          "I understand your concern. Could you provide more details?",
          "Let me review this and I'll respond in a moment."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.messageCallbacks.forEach(callback => 
          callback({ text: randomResponse, sender: "doctor" })
        );
      }, 1000);
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ text: message, sender: "user" }));
    } else {
      this.notifyConnectionStatus('error', 'Chat service is not connected');
    }
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
  }

  private notifyConnectionStatus(status: 'connected' | 'disconnected' | 'error', message?: string) {
    this.connectionCallbacks.forEach(callback => callback(status, message));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.reconnectAttempts = 0;
  }
}

export const chatService = new WebSocketService(); 