type MessageCallback = (message: { text: string; sender: "user" | "doctor" }) => void;
type ConnectionCallback = (status: 'connected' | 'disconnected' | 'error', message?: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private mockMode = false; // Set to false to use real WebSocket server
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private backendUrl: string;

  constructor() {
    // Get the backend URL from environment variables or use a default
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8000';
  }

  connect(doctorId: string, userId: string) {
    if (this.mockMode) {
      console.log('WebSocket running in mock mode');
      this.notifyConnectionStatus('connected');
      return;
    }

    try {
      const wsUrl = `${this.backendUrl}/chat/${doctorId}/${userId}`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionStatus('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          this.messageCallbacks.forEach(callback => callback({
            text: message.text,
            sender: message.sender
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
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
      const messageObject = {
        text: message,
        timestamp: new Date().toISOString()
      };
      this.socket.send(JSON.stringify(messageObject));
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