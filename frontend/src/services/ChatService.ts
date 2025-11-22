import { toast } from 'react-hot-toast';

export interface Message {
    id: string;
    text: string;
    sender_id: string;
    receiver_id: string;
    timestamp: string;
    conversation_id: string;
}

export class ChatService {
    private socket: WebSocket | null = null;
    private messageHandlers: ((message: Message) => void)[] = [];

    constructor(private baseUrl: string = 'ws://localhost:8000') {}

    connect(doctorId: string, userId: string, token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // Close existing connection if any
                if (this.socket) {
                    this.socket.close();
                }

                this.socket = new WebSocket(`${this.baseUrl}/chat/${doctorId}/${userId}?token=${token}`);

                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.messageHandlers.forEach(handler => handler(message));
                };

                this.socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    toast.error('Connection error occurred');
                    reject(error);
                };

                this.socket.onclose = () => {
                    console.log('WebSocket disconnected');
                    toast.error('Chat disconnected');
                };

            } catch (error) {
                console.error('Failed to connect:', error);
                reject(error);
            }
        });
    }

    sendMessage(message: string, senderId: string, receiverId: string) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            toast.error('Chat not connected');
            return;
        }

        const messageData = {
            text: message,
            sender_id: senderId,
            receiver_id: receiverId
        };

        this.socket.send(JSON.stringify(messageData));
    }

    onMessage(handler: (message: Message) => void) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    async getChatHistory(conversationId: string, token: string): Promise<Message[]> {
        try {
            const response = await fetch(`http://localhost:8000/chat/history/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching chat history:', error);
            toast.error('Could not load chat history');
            return [];
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
