import { toast } from "sonner";

interface WebSocketMessage {
  id: string;
  conversation_id: string;
  text: string;
  sender_id: string;
  receiver_id: string;
  timestamp: string;
}

type MessageCallback = (message: WebSocketMessage) => void;
type ConnectionCallback = (status: boolean) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageListeners: MessageCallback[] = [];
  private connectionListeners: ConnectionCallback[] = [];
  private doctorId: string | null = null;
  private userId: string | null = null;
  private baseUrl: string;

  constructor() {
    // Initialize event listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.baseUrl = import.meta.env.VITE_API_URL || "localhost:8000";
    console.log("WebSocket service initialized with base URL:", this.baseUrl);
  }

  // Set the authentication token
  setToken(token: string) {
    this.token = token;
    return this;
  }

  // Set the doctor ID
  setDoctorId(doctorId: string) {
    this.doctorId = doctorId;
    return this;
  }

  // Set the user ID
  setUserId(userId: string) {
    this.userId = userId;
    return this;
  }

  // Connect to the WebSocket server
  connect() {
    // Check if we have a token and both IDs
    if (!this.token) {
      console.error("WebSocket: No authentication token provided");
      return this;
    }

    if (!this.userId) {
      console.error("WebSocket: User ID not provided");
      return this;
    }

    // We need either a doctor ID or a general chat endpoint
    if (!this.doctorId) {
      console.warn("WebSocket: No doctor ID provided, using default chat");
    }

    // Close any existing connections
    this.disconnect();

    // Create a new WebSocket connection
    try {
      const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Format WebSocket URL according to backend API expectations
      // URL format: ws://localhost:8000/chat/{doctor_id}/{user_id}?token={token}
      const receiverId = this.doctorId || "general"; // Use "general" if no doctor ID
      const wsUrl = `${wsProtocol}//${this.baseUrl}/chat/${receiverId}/${this.userId}?token=${this.token}`;
      
      console.log(`Connecting to WebSocket at: ${wsUrl.substring(0, wsUrl.indexOf('?token=') + 7)}[TOKEN HIDDEN]`);
      
      this.socket = new WebSocket(wsUrl);
      
      // Setup event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
      console.log("WebSocket: Connecting...");
    } catch (error) {
      console.error("WebSocket: Connection error", error);
      this.notifyConnectionListeners(false);
    }

    return this;
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log("WebSocket: Disconnected");
    }

    // Clear any reconnect timers
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    return this;
  }

  // Send a message through the WebSocket
  sendMessage(text: string, receiverId: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      toast.error("Connection lost. Reconnecting...");
      this.reconnect();
      return false;
    }

    try {
      const message = {
        text,
        sender_id: this.userId,
        receiver_id: receiverId
      };

      console.log("Sending message via WebSocket:", message);
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error("WebSocket: Failed to send message", error);
      return false;
    }
  }

  // Register a callback for incoming messages
  onMessage(callback: MessageCallback) {
    this.messageListeners.push(callback);
    return this;
  }

  // Remove a message callback
  offMessage(callback: MessageCallback) {
    this.messageListeners = this.messageListeners.filter(listener => listener !== callback);
    return this;
  }

  // Register a callback for connection status changes
  onConnectionChange(callback: ConnectionCallback) {
    this.connectionListeners.push(callback);
    return this;
  }

  // Remove a connection callback
  offConnectionChange(callback: ConnectionCallback) {
    this.connectionListeners = this.connectionListeners.filter(listener => listener !== callback);
    return this;
  }

  // Handle successful WebSocket connection
  private handleOpen() {
    console.log("WebSocket: Connected");
    this.reconnectAttempts = 0;
    this.notifyConnectionListeners(true);
  }

  // Handle incoming WebSocket messages
  private handleMessage(event: MessageEvent) {
    try {
      console.log("WebSocket raw message received:", event.data);
      const message = JSON.parse(event.data);
      
      // Notify listeners
      this.messageListeners.forEach(listener => listener(message));
    } catch (error) {
      console.error("WebSocket: Failed to parse message", error, event.data);
    }
  }

  // Handle WebSocket connection closed
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket: Connection closed (${event.code})`, event.reason);
    this.socket = null;
    this.notifyConnectionListeners(false);
    
    // Auto-reconnect if it wasn't a normal closure
    if (event.code !== 1000) {
      this.reconnect();
    }
  }

  // Handle WebSocket errors
  private handleError(event: Event) {
    console.error("WebSocket: Error", event);
    this.notifyConnectionListeners(false);
  }

  // Attempt to reconnect with exponential backoff
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("WebSocket: Max reconnect attempts reached");
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  // Handle browser going online
  private handleOnline = () => {
    console.log("WebSocket: Browser went online");
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.reconnectAttempts = 0;
      this.connect();
    }
  };

  // Handle browser going offline
  private handleOffline = () => {
    console.log("WebSocket: Browser went offline");
    this.notifyConnectionListeners(false);
  };

  // Notify all connection status listeners
  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }
  
  // Get chat history for a specific doctor and user
  async getChatHistory(doctorId: string, userId: string) {
    try {
      const token = this.token || localStorage.getItem('access_token');
      if (!token) {
        console.error("No authentication token for chat history");
        return [];
      }
      
      const protocol = location.protocol === 'https:' ? 'https:' : 'http:';
      const apiUrl = `${protocol}//${this.baseUrl}/chat/history/${doctorId}_${userId}`;
      
      console.log(`Fetching chat history from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }
      
      const messages = await response.json();
      return messages;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService; 