import { useState, useRef, useEffect } from "react"
import { MessageSquare, User, Send, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMessages, Message } from "@/hooks/useMessages"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

// Simple Badge component
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Badge({ children, className = "", ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function DoctorChat() {
  const { user } = useAuth()
  const { messages, unreadCount, sendMessage, markAsRead, markAllAsRead, isLoading } = useMessages()
  const [chatOpen, setChatOpen] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // When we receive a new message, show a notification if the chat is closed
  useEffect(() => {
    if (unreadCount > 0 && !chatOpen) {
      setShowNotification(true)
    }
  }, [unreadCount, chatOpen])

  // Auto-scroll to the latest message
  useEffect(() => {
    if (scrollRef.current && chatOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, chatOpen, selectedUserId])

  // Get unique users from messages
  const getUniqueUsers = () => {
    if (!user || !messages) return []
    
    const uniqueUsers = new Map()
    
    messages.forEach(message => {
      // Add sender if it's not the current user
      if (message.sender_id !== user.id) {
        uniqueUsers.set(message.sender_id, {
          id: message.sender_id,
          name: message.sender_name || `User ${message.sender_id}`,
          lastMessage: message,
          hasUnread: !message.read && message.receiver_id === user.id
        })
      }
      // Add receiver if it's not the current user
      else if (message.receiver_id !== user.id) {
        const existing = uniqueUsers.get(message.receiver_id)
        if (!existing || new Date(message.timestamp) > new Date(existing.lastMessage.timestamp)) {
          uniqueUsers.set(message.receiver_id, {
            id: message.receiver_id,
            name: message.receiver_name || `User ${message.receiver_id}`,
            lastMessage: message,
            hasUnread: false
          })
        }
      }
    })
    
    return Array.from(uniqueUsers.values())
  }

  const uniqueUsers = getUniqueUsers()

  // Get conversation with selected user
  const getConversation = () => {
    if (!selectedUserId || !messages) return []
    
    return messages.filter(message => 
      (message.sender_id === selectedUserId && message.receiver_id === user?.id) || 
      (message.sender_id === user?.id && message.receiver_id === selectedUserId)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const conversation = getConversation()

  // Mark messages from selected user as read
  useEffect(() => {
    if (selectedUserId && chatOpen && messages) {
      const unreadMessages = messages.filter(
        message => message.sender_id === selectedUserId && 
                  message.receiver_id === user?.id && 
                  !message.read
      )
      
      // Mark each unread message as read
      unreadMessages.forEach(message => {
        markAsRead.mutate(message.id)
      })
    }
  }, [selectedUserId, chatOpen, messages, user, markAsRead])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return
    
    try {
      await sendMessage.mutateAsync({
        receiverId: selectedUserId,
        content: newMessage
      })
      setNewMessage("")
      toast.success("Message sent")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const handleNotificationClick = () => {
    setChatOpen(true)
    setShowNotification(false)
    
    // If there are unread messages, select the first user with unread messages
    if (unreadCount > 0) {
      const userWithUnread = uniqueUsers.find(u => u.hasUnread)
      if (userWithUnread) {
        setSelectedUserId(userWithUnread.id)
      }
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <>
      {/* Floating chat button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
        {showNotification && (
          <div 
            className="bg-white rounded-lg shadow-lg p-3 mb-2 animate-bounce cursor-pointer"
            onClick={handleNotificationClick}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">
                {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
              </span>
            </div>
          </div>
        )}
        
        <Button
          onClick={() => setChatOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 flex items-center justify-center relative"
        >
          <MessageSquare className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>Doctor Messages</DialogTitle>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex flex-1 overflow-hidden">
            {/* User list sidebar */}
            <div className="w-1/3 border-r overflow-hidden flex flex-col">
              <div className="p-3 font-medium text-sm text-gray-500">
                {isLoading ? "Loading conversations..." : 
                 uniqueUsers.length === 0 ? "No conversations yet" : 
                 `${uniqueUsers.length} Conversations`}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {uniqueUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedUserId === user.id ? 'bg-gray-100' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 w-9 h-9 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{user.name}</span>
                          {user.hasUnread && (
                            <Badge>New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {user.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(user.lastMessage.timestamp)}
                        </p>
                      </div>
                    </div>
                    <hr className="mt-3 border-gray-200" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {selectedUserId ? (
                <>
                  <div className="p-3 border-b font-medium flex items-center">
                    <div className="bg-blue-100 w-7 h-7 rounded-full flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    {uniqueUsers.find(u => u.id === selectedUserId)?.name || "Chat"}
                  </div>
                  
                  <div className="flex-1 p-3 overflow-y-auto" ref={scrollRef}>
                    <div className="space-y-4">
                      {conversation.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg p-3 
                              ${message.sender_id === user?.id ? 
                                'bg-blue-600 text-white' : 
                                'bg-gray-200 text-gray-800'}`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 
                              ${message.sender_id === user?.id ? 
                                'text-blue-200' : 
                                'text-gray-500'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 border-t flex gap-2">
                    <Input 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessage.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center p-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <h3 className="font-medium text-lg">Your Messages</h3>
                    <p className="text-sm">Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 