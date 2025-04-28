import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Loader2, CheckCheck, Clock, Wifi, WifiOff, Check, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import websocketService from "@/services/websocketService"
import { toast } from "sonner"
import { ServerStatus } from "./ServerStatus"
import { format } from "date-fns"

interface CommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: {
    id: string
    name: string
    imageUrl: string
  }
  userId: string
}

interface ChatMessage {
  id?: string;
  text: string;
  sender: "user" | "doctor";
  timestamp?: string;
  status?: "sending" | "sent" | "delivered" | "read" | "error";
}

export function CommunicationModal({ isOpen, onClose, doctor, userId }: CommunicationModalProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
  const [typing, setTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatInitializedRef = useRef(false)
  
  // Format date for chat bubbles
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, "h:mm a");
    } catch (e) {
      return "";
    }
  }
  
  // Format date for message groups
  const formatMessageDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return format(date, "MMMM d, yyyy");
      }
    } catch (e) {
      return "";
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus the textarea when connected
  useEffect(() => {
    if (status === 'connected' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [status]);

  // Load chat history and initialize chat connection when modal opens
  useEffect(() => {
    if (!isOpen || !userId || !doctor.id) return
    
    // Prevent multiple initializations
    if (chatInitializedRef.current) return

    chatInitializedRef.current = true
    
    const loadChatAndConnect = async () => {
      setStatus('connecting')
      
      console.log('CommunicationModal: Starting chat with doctor:', doctor.id);
      console.log('CommunicationModal: Current user ID:', userId);
      
      // Load chat history
      try {
        setIsLoadingHistory(true)
        const history = await websocketService.getChatHistory(doctor.id, userId)
        if (history && history.length > 0) {
          console.log(`CommunicationModal: Loaded ${history.length} messages from history`);
          // Transform messages to expected format
          const formattedMessages = history.map((msg: any) => ({
            id: msg.id,
            text: msg.text || msg.content,
            sender: msg.sender_id === userId ? "user" : "doctor",
            timestamp: msg.timestamp,
            status: "delivered"
          } as ChatMessage));
          // Messages come in reverse chronological order, so we need to reverse them
          setMessages(formattedMessages.reverse())
        } else {
          console.log('CommunicationModal: No message history found');
          // Initialize with empty messages array
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err)
        toast.error("Could not load previous messages")
      } finally {
        setIsLoadingHistory(false)
      }
      
      // Connect to chat
      const token = localStorage.getItem('access_token');
      if (!token) {
        setStatus('error');
        setErrorMessage("Authentication required. Please log in.");
        return;
      }
      
      websocketService
        .setToken(token)
        .setUserId(userId)
        .setDoctorId(doctor.id)
        .connect();
      
      // Setup message handler
      const handleMessage = (message: any) => {
        console.log('CommunicationModal: Received new message:', message);
        if (message.text && message.sender_id) {
          const newMessage: ChatMessage = {
            id: message.id,
            text: message.text,
            sender: message.sender_id === userId ? "user" : "doctor",
            timestamp: message.timestamp || new Date().toISOString(),
            status: "delivered"
          };
          setMessages(prev => [...prev, newMessage]);
          
          // Play notification sound when we receive a message from the doctor
          if (message.sender_id !== userId) {
            const audio = new Audio('/sounds/message.mp3');
            audio.play().catch(e => console.log('Could not play notification sound', e));
          }
        }
      };
      
      // Setup connection handler
      const handleConnectionChange = (connected: boolean) => {
        console.log(`CommunicationModal: Connection status changed to ${connected ? 'connected' : 'disconnected'}`);
        setStatus(connected ? 'connected' : 'disconnected');
        if (connected) {
          setErrorMessage("");
          toast.success("Connected to chat");
        } else {
          toast.warning("Chat disconnected. Reconnecting...");
        }
      };
      
      // Register listeners
      websocketService
        .onMessage(handleMessage)
        .onConnectionChange(handleConnectionChange);
    }

    loadChatAndConnect()

    return () => {
      chatInitializedRef.current = false;
      websocketService.disconnect();
    }
  }, [isOpen, doctor.id, userId])
  
  // Handle message typing indicator
  const handleTyping = () => {
    if (!typing) {
      setTyping(true);
      // TODO: Send typing indication to backend when implemented
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setTyping(false);
      // TODO: Send stopped typing indication to backend when implemented
    }, 3000);
    
    setTypingTimeout(timeout);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return
    if (status !== 'connected') {
      toast.error("Cannot send message: Chat is not connected");
      return;
    }
    
    const messageId = `temp-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Add message to local state immediately with "sending" status
    setMessages(prev => [...prev, {
      id: messageId,
      text: message,
      sender: "user",
      timestamp: timestamp,
      status: "sending"
    } as ChatMessage]);

    // Send message via WebSocket
    const sent = websocketService.sendMessage(message, doctor.id);
    
    if (sent) {
      // Update message status to "sent"
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: "sent" } as ChatMessage 
              : msg
          )
        );
        
        // Simulate "delivered" status after a short delay
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId 
                ? { ...msg, status: "delivered" } as ChatMessage
                : msg
            )
          );
        }, 1000);
      }, 500);
      
      setMessage("");
      
      // Clear typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      setTyping(false);
    } else {
      toast.error("Failed to send message. Please try again.");
      
      // Update message status to indicate error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: "error" } as ChatMessage
            : msg
        )
      );
    }
  }
  
  // Group messages by date
  const getGroupedMessages = () => {
    const groups: {date: string; messages: ChatMessage[]}[] = [];
    
    messages.forEach(msg => {
      const msgDate = msg.timestamp ? formatMessageDate(msg.timestamp) : "Unknown";
      
      // Find existing group or create new one
      let group = groups.find(g => g.date === msgDate);
      if (!group) {
        group = {date: msgDate, messages: []};
        groups.push(group);
      }
      
      group.messages.push(msg);
    });
    
    return groups;
  }
  
  const messageGroups = getGroupedMessages();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-3 border-b shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={doctor.imageUrl} 
                alt={doctor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-base">{doctor.name}</h3>
                <div className="flex items-center text-xs text-gray-500">
                  {status === 'connecting' && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  )}
                  {status === 'connected' && (
                    <div className="flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-green-500" />
                      <span>Online</span>
                    </div>
                  )}
                  {status === 'disconnected' && (
                    <div className="flex items-center gap-1">
                      <WifiOff className="w-3 h-3 text-yellow-500" />
                      <span>Reconnecting...</span>
                    </div>
                  )}
                  {status === 'error' && (
                    <span className="text-red-500">Connection error</span>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {status === 'error' ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-red-500">
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">{errorMessage}</p>
              {errorMessage.includes('Authentication') && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">You need to be logged in to chat with doctors</p>
                  <Button
                    onClick={() => {
                      window.location.href = '/login';
                      onClose();
                    }}
                    variant="outline"
                    className="text-sm"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
              {!errorMessage.includes('Authentication') && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      // Try reconnecting
                      websocketService.disconnect();
                      setStatus('connecting');
                      
                      const token = localStorage.getItem('access_token');
                      if (token) {
                        websocketService
                          .setToken(token)
                          .setUserId(userId)
                          .setDoctorId(doctor.id)
                          .connect();
                      } else {
                        setErrorMessage("Authentication required. Please log in.");
                      }
                    }}
                    variant="outline"
                    className="text-sm mr-2"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="text-sm"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto bg-[#e5ded8] bg-opacity-30 p-4 space-y-4">
              {isLoadingHistory && messages.length === 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#008080]" />
                </div>
              )}
              
              {messageGroups.length === 0 && !isLoadingHistory && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="bg-white rounded-full p-4 mb-3">
                    <MessageCircle className="h-8 w-8 text-[#008080]" />
                  </div>
                  <h3 className="font-medium">Start a conversation</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Chat with {doctor.name} about your health concerns
                  </p>
                </div>
              )}
              
              {messageGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="flex justify-center">
                    <div className="bg-white px-2 py-1 rounded-lg text-xs text-gray-500 shadow-sm">
                      {group.date}
                    </div>
                  </div>
                  
                  {group.messages.map((msg, msgIndex) => {
                    // Check if this message is part of a sequence from the same sender
                    const isSequence = msgIndex > 0 && 
                                      group.messages[msgIndex - 1].sender === msg.sender;
                    
                    return (
                      <div 
                        key={msg.id || msgIndex}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[70%] px-3 py-2 rounded-lg shadow-sm
                            ${msg.sender === "user" 
                                ? "bg-[#dcf8c6] text-black rounded-tr-none" 
                                : "bg-white text-black rounded-tl-none"}`}
                        >
                          {!isSequence && msg.sender === "doctor" && (
                            <div 
                              className="absolute -top-0 -left-2 border-8 border-transparent border-r-white border-b-white"
                              style={{transform: "rotate(45deg)"}}
                            />
                          )}
                          
                          {!isSequence && msg.sender === "user" && (
                            <div 
                              className="absolute -top-0 -right-2 border-8 border-transparent border-l-[#dcf8c6] border-b-[#dcf8c6]"
                              style={{transform: "rotate(45deg)"}}
                            />
                          )}
                          
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          
                          <div className="flex items-center justify-end mt-1 space-x-1">
                            <span className="text-[10px] text-gray-500">
                              {msg.timestamp ? formatMessageTime(msg.timestamp) : ""}
                            </span>
                            
                            {msg.sender === "user" && (
                              <>
                                {msg.status === "sending" && (
                                  <Clock className="h-3 w-3 text-gray-400" />
                                )}
                                {msg.status === "sent" && (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )}
                                {msg.status === "delivered" && (
                                  <CheckCheck className="h-3 w-3 text-gray-400" />
                                )}
                                {msg.status === "read" && (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing indicator */}
              {typing && status === 'connected' && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2 rounded-lg text-gray-500 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}} />
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "600ms"}} />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ref for auto-scrolling */}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-3 border-t bg-white flex gap-2 items-end">
              <Textarea 
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={status === 'connected' ? "Type a message" : "Connecting..."}
                className="resize-none min-h-[42px] max-h-24 py-2 px-3"
                disabled={status !== 'connected'}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || status !== 'connected'}
                className="rounded-full h-10 w-10 p-0 bg-[#008080] hover:bg-[#006666] flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 