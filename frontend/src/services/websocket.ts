type MessageCallback = (message: { text: string; sender: "user" | "doctor" }) => void;
type ConnectionCallback = (status: 'connected' | 'connecting' | 'disconnected' | 'error', message?: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private mockMode = false; // Set to false to use real backend
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private token: string | null = null;
  private isDevelopment = window.location.hostname === 'localhost';
  private apiUrl = 'http://localhost:8000';
  private wsUrl = 'ws://localhost:8000';
  private mockModeCallbacks: ((mockMode: boolean) => void)[] = [];
  private isConnecting = false; // Flag to prevent multiple connection attempts
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private currentDoctorId: string | null = null;
  private currentUserId: string | null = null;

  constructor() {
    // Get token from localStorage if available
    this.token = localStorage.getItem('access_token');
    
    // Log token status (without revealing the actual token)
    console.log('WebSocket Service initialized');
    console.log('Development mode:', this.isDevelopment);
    console.log('Mock mode enabled:', this.mockMode);
    console.log('Auth token present:', this.token ? 'Yes' : 'No');
    
    // Check if backend is reachable
    this.checkBackendConnection();
  }
  
  // Add callback for mock mode changes
  onMockModeChange(callback: (mockMode: boolean) => void) {
    this.mockModeCallbacks.push(callback);
    // Call immediately with current state
    callback(this.mockMode);
    return () => {
      this.mockModeCallbacks = this.mockModeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Get current mock mode status
  isMockMode() {
    return this.mockMode;
  }
  
  // Set mock mode and notify listeners
  setMockMode(value: boolean) {
    if (this.mockMode !== value) {
      this.mockMode = value;
      console.log(`Mock mode ${value ? 'enabled' : 'disabled'}`);
      this.mockModeCallbacks.forEach(callback => callback(value));
    }
  }
  
  // Check if backend is reachable
  private async checkBackendConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/`);
      if (response.ok) {
        console.log('Backend API is reachable');
        this.setMockMode(false);
      } else {
        console.warn('Backend API returned error status:', response.status);
        if (this.isDevelopment) {
          console.warn('Falling back to mock mode due to API error');
          this.setMockMode(true);
        }
      }
    } catch (error) {
      console.error('Failed to connect to backend API:', error);
      if (this.isDevelopment) {
        console.warn('Falling back to mock mode due to connection error');
        this.setMockMode(true);
      }
    }
  }

  // Get current connection state
  getConnectionState() {
    return this.connectionState;
  }

  connect(doctorId: string, userId: string) {
    // If doctor or user ID changed but we have an existing connection,
    // disconnect first and reset state
    if ((this.currentDoctorId !== doctorId || this.currentUserId !== userId) &&
        (this.currentDoctorId !== null && this.currentUserId !== null)) {
      console.log('Chat participants changed, resetting connection');
      this.disconnect();
    }

    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('Connection attempt already in progress, ignoring');
      return;
    }
    
    // Check if already connected to the same chat
    if (this.connectionState === 'connected' && 
        this.currentDoctorId === doctorId && 
        this.currentUserId === userId) {
      console.log('Already connected to this chat, ignoring reconnect');
      return;
    }
    
    // Update current chat participants
    this.currentDoctorId = doctorId;
    this.currentUserId = userId;
    
    // Flag that we're connecting
    this.isConnecting = true;
    this.connectionState = 'connecting';
    this.notifyConnectionStatus('connecting');
    
    // Update token in case it changed
    this.token = localStorage.getItem('access_token');
    console.log('Token from localStorage:', this.token ? 'Token exists' : 'No token found');
    
    if (this.mockMode) {
      console.log('WebSocket running in mock mode');
      this.connectionState = 'connected';
      this.notifyConnectionStatus('connected');
      this.isConnecting = false;
      return;
    }

    // Check if token exists before attempting to connect
    if (!this.token) {
      console.error('No authentication token found');
      this.connectionState = 'error';
      this.notifyConnectionStatus('error', 'Authentication required. Please log in.');
      this.isConnecting = false;
      return;
    }

    try {
      // Close existing connection if any
      if (this.socket) {
        console.log('Closing existing WebSocket connection');
        this.socket.close();
        this.socket = null;
      }
      
      // Use the WebSocket endpoint from the backend
      const wsEndpoint = `${this.wsUrl}/chat/${doctorId}/${userId}?token=${this.token}`;
      
      console.log(`Connecting to WebSocket: ${wsEndpoint.substring(0, wsEndpoint.indexOf('?token=') + 7)}[TOKEN]`);
      this.socket = new WebSocket(wsEndpoint);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.connectionState = 'connected';
        this.notifyConnectionStatus('connected');
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket received message:', message);
          
          // Handle ping messages for heartbeat
          if (message.type === 'ping') {
            console.log('Heartbeat ping received');
            return;
          }
          
          // Handle error messages
          if (message.error) {
            console.error('WebSocket error from server:', message.error);
            return;
          }
          
          // Format the message for the UI
          const formattedMessage = {
            text: message.text,
            sender: message.sender_id === userId ? "user" : "doctor" as "user" | "doctor"
          };
          
          this.messageCallbacks.forEach(callback => callback(formattedMessage));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket connection closed: Code ${event.code}, Reason: ${event.reason}`);
        this.isConnecting = false;
        
        // Don't attempt to reconnect if this was intentional (code 1000)
        if (event.code === 1000) {
          this.connectionState = 'disconnected';
          this.notifyConnectionStatus('disconnected');
          return;
        }
        
        // Don't reconnect if we already have too many attempts
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionState = 'error';
          this.notifyConnectionStatus('error', 'Failed to connect after multiple attempts');
          return;
        }
        
        this.connectionState = 'disconnected';
        this.notifyConnectionStatus('disconnected');
        this.handleReconnection(doctorId, userId);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        
        // In development, fallback to mock mode if connection fails
        if (this.isDevelopment && this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('Falling back to mock mode after failed connection attempts');
          this.setMockMode(true);
          this.reconnectAttempts = 0;
          this.connectionState = 'connected';
          this.notifyConnectionStatus('connected');
          return;
        }
        
        this.connectionState = 'error';
        this.notifyConnectionStatus('error', 'Failed to connect to chat service');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.connectionState = 'error';
      this.notifyConnectionStatus('error', 'Failed to initialize chat service');
    }
  }

  private handleReconnection(doctorId: string, userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      // Add exponential backoff for reconnection attempts
      const backoffTime = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`Will try again in ${backoffTime / 1000} seconds`);
      
      setTimeout(() => {
        if (!this.isConnecting) {
          this.connect(doctorId, userId);
        }
      }, backoffTime);
    } else {
      console.warn('Max reconnection attempts reached');
      if (this.isDevelopment) {
        console.log('Switching to mock mode after failed reconnections');
        this.setMockMode(true);
        this.connectionState = 'connected';
        this.notifyConnectionStatus('connected');
      } else {
        this.connectionState = 'error';
        this.notifyConnectionStatus('error', 'Could not reconnect to chat service');
      }
    }
  }

  sendMessage(message: string) {
    if (this.mockMode) {
      // Simulate message sending and doctor's response
      console.log('Mock mode: Sending message:', message);
      
      // Add user message to callbacks
      const userMessage = { text: message, sender: "user" as "user" | "doctor" };
      this.messageCallbacks.forEach(callback => callback(userMessage));
      
      // Generate mock response after a delay
      setTimeout(() => {
        const responses = [
          "I'll check your records and get back to you shortly.",
          "Thank you for your message. How can I help you today?",
          "I understand your concern. Could you provide more details?",
          "Let me review this and I'll respond in a moment."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        console.log('Mock mode: Doctor response:', randomResponse);
        
        const doctorMessage = { text: randomResponse, sender: "doctor" as "user" | "doctor" };
        this.messageCallbacks.forEach(callback => callback(doctorMessage));
      }, 1000);
      return;
    }

    // Handle real WebSocket connection
    if (this.socket?.readyState === WebSocket.OPEN) {
      // Get user and doctor IDs from URL
      const url = this.socket.url;
      const urlParts = url.split('/');
      const doctorId = urlParts[urlParts.length - 2];
      const userIdWithParams = urlParts[urlParts.length - 1];
      const userId = userIdWithParams.split('?')[0];
      
      console.log(`Sending message to doctor ${doctorId} from user ${userId}`);
      
      // Format message according to backend expectations
      const messageData = {
        text: message,
        sender_id: userId,
        receiver_id: doctorId
      };
      
      console.log('Sending WebSocket message:', messageData);
      this.socket.send(JSON.stringify(messageData));
    } else {
      console.error('Cannot send message: WebSocket not connected');
      this.notifyConnectionStatus('error', 'Chat service is not connected');
    }
  }

  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback);
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
  }

  private notifyConnectionStatus(status: 'connected' | 'connecting' | 'disconnected' | 'error', message?: string) {
    this.connectionCallbacks.forEach(callback => callback(status, message));
  }

  disconnect() {
    // Clear current chat participants
    this.currentDoctorId = null;
    this.currentUserId = null;
    
    if (this.socket) {
      // Use code 1000 for normal closure
      this.socket.close(1000, "Disconnected by user");
      this.socket = null;
    }
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.reconnectAttempts = 0;
    this.connectionState = 'disconnected';
  }
  
  // Method to load chat history
  async loadChatHistory(doctorId: string, userId: string, limit: number = 50) {
    // If loading history for different participants, clear any previous messages
    if ((this.currentDoctorId !== doctorId || this.currentUserId !== userId) &&
        (this.currentDoctorId !== null && this.currentUserId !== null)) {
      console.log('Chat participants changed, clearing previous history');
      // Update tracking
      this.currentDoctorId = doctorId;
      this.currentUserId = userId;
    }
    
    // Use mock data if in mock mode
    if (this.mockMode) {
      console.log('Using mock data for chat history');
      return this.getMockChatHistory();
    }
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No authentication token found for chat history');
        return [];
      }
      
      const url = `${this.apiUrl}/chat/history/${doctorId}_${userId}?limit=${limit}`;
      console.log(`Fetching chat history from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch chat history: ${response.status} - ${errorText}`);
        
        // In development, fall back to mock data
        if (this.isDevelopment) {
          console.log('Falling back to mock chat history');
          this.setMockMode(true);
          return this.getMockChatHistory();
        }
        
        throw new Error(`Failed to fetch chat history: ${response.status}`);
      }
      
      const messages = await response.json();
      console.log(`Retrieved ${messages.length} messages from history`);
      
      // Format messages for UI
      return messages.map((msg: any) => ({
        text: msg.text,
        sender: msg.sender_id === userId ? "user" : "doctor"
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      
      // In development, fall back to mock data
      if (this.isDevelopment) {
        console.log('Falling back to mock chat history after error');
        this.setMockMode(true);
        return this.getMockChatHistory();
      }
      
      return [];
    }
  }
  
  // Generate mock chat history for development/demo purposes
  private getMockChatHistory() {
    console.log('Generating mock chat history');
    return [
      { text: "Hello Dr., I've been experiencing some mild headaches recently. They usually start in the afternoon and last a few hours.", sender: "user" as "user" | "doctor" },
      { text: "Hello! I'm sorry to hear about your headaches. How long have you been experiencing them? And have you noticed any triggers?", sender: "doctor" as "user" | "doctor" },
      { text: "They started about a week ago. I think they might be related to stress at work, and possibly not drinking enough water.", sender: "user" as "user" | "doctor" },
      { text: "That's helpful information. Stress and dehydration are common triggers. Are you taking any medication for them? And have you had any other symptoms like nausea or sensitivity to light?", sender: "doctor" as "user" | "doctor" },
      { text: "I've been taking over-the-counter pain relievers, which help temporarily. No nausea, but I do feel some sensitivity to bright screens.", sender: "user" as "user" | "doctor" },
      { text: "Thanks for sharing that. I'd recommend increasing your water intake and taking short breaks from screens. If the headaches persist or worsen, we should schedule an appointment for a more thorough examination.", sender: "doctor" as "user" | "doctor" }
    ];
  }
}

export const chatService = new WebSocketService(); 