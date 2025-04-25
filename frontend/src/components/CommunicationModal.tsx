import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { chatService } from "@/services/websocket"
import { toast } from "sonner"
import { ServerStatus } from "./ServerStatus"

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

export function CommunicationModal({ isOpen, onClose, doctor, userId }: CommunicationModalProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "doctor" }[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInitializedRef = useRef(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
        const history = await chatService.loadChatHistory(doctor.id, userId)
        if (history && history.length > 0) {
          console.log(`CommunicationModal: Loaded ${history.length} messages from history`);
          // Messages come in reverse chronological order, so we need to reverse them
          setMessages(history.reverse())
        } else {
          console.log('CommunicationModal: No message history found or using mock data');
        }
      } catch (err) {
        console.error("Failed to load chat history:", err)
        toast.error("Could not load previous messages")
      } finally {
        setIsLoadingHistory(false)
      }
      
      // Connect to chat
      chatService.connect(doctor.id, userId)
      
      chatService.onMessage((message) => {
        console.log('CommunicationModal: Received new message:', message.sender, message.text.substring(0, 20) + (message.text.length > 20 ? '...' : ''));
        setMessages(prev => [...prev, message])
      })

      chatService.onConnectionChange((status, message) => {
        console.log(`CommunicationModal: Connection status changed to ${status}`, message || '');
        switch (status) {
          case 'connected':
            setStatus('connected')
            setErrorMessage("")
            toast.success("Connected to chat")
            break
          case 'connecting':
            setStatus('connecting')
            break
          case 'disconnected':
            setStatus('disconnected')
            toast.warning("Chat disconnected. Attempting to reconnect...")
            break
          case 'error':
            setStatus('error')
            setErrorMessage(message || "Failed to connect")
            toast.error(message || "Chat connection failed")
            break
        }
      })
    }

    loadChatAndConnect()

    return () => {
      chatInitializedRef.current = false
      chatService.disconnect()
    }
  }, [isOpen, doctor.id, userId])

  const handleSendMessage = () => {
    if (!message.trim()) return
    if (status !== 'connected') {
      toast.error("Cannot send message: Chat is not connected")
      return
    }

    chatService.sendMessage(message)
    setMessage("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-4">
            <img 
              src={doctor.imageUrl} 
              alt={doctor.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex items-center gap-2">
              <span>{doctor.name}</span>
              <MessageCircle className="w-5 h-5 text-[#008080]" />
              {status === 'connecting' && (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-[#008080]" />
                  <span className="text-xs text-gray-500">Connecting...</span>
                </div>
              )}
              {status === 'connected' && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Connected"></span>
              )}
              {status === 'disconnected' && (
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full" title="Disconnected"></span>
              )}
              {status === 'error' && (
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" title="Error"></span>
              )}
            </div>
          </DialogTitle>
          <ServerStatus />
        </DialogHeader>

        <div className="mt-4">
          <div className="h-96 flex flex-col">
            {status === 'error' ? (
              <div className="flex-1 flex items-center justify-center">
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
                          chatService.disconnect();
                          setStatus('connecting');
                          chatService.connect(doctor.id, userId);
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
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                  {isLoadingHistory && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-[#008080]" />
                    </div>
                  )}
                  
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender === "user"
                            ? "bg-[#008080] text-white"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  
                  {messages.length === 0 && !isLoadingHistory && (
                    <p className="text-center text-gray-500 py-4">
                      Start a conversation with {doctor.name}
                    </p>
                  )}
                  
                  {/* Ref for auto-scrolling */}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={status === 'connected' ? "Type your message..." : "Connecting to chat..."}
                    className="resize-none"
                    disabled={status !== 'connected'}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#008080] hover:bg-[#006666]"
                    disabled={status !== 'connected'}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 