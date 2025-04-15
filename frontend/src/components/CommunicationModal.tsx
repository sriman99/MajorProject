import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { chatService } from "@/services/websocket"
import { toast } from "sonner"

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

  // Initialize chat connection when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('connecting')
      chatService.connect(doctor.id, userId)
      
      chatService.onMessage((message) => {
        setMessages(prev => [...prev, message])
      })

      chatService.onConnectionChange((status, message) => {
        switch (status) {
          case 'connected':
            setStatus('connected')
            setErrorMessage("")
            toast.success("Connected to chat")
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

    return () => {
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
                <Loader2 className="w-4 h-4 animate-spin text-[#008080]" />
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="h-96 flex flex-col">
            {status === 'error' ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-red-500">
                  <p className="font-medium">Connection Error</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
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
                  {messages.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Start a conversation with {doctor.name}
                    </p>
                  )}
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