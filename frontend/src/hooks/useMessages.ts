import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from './useAuth'
import { useState, useCallback } from 'react'

// Message interface
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  timestamp: string
  read: boolean
  sender_name?: string
  receiver_name?: string
}

export const useMessages = () => {
  const { user, isLoggedIn } = useAuth()
  const queryClient = useQueryClient()
  const [localMessages, setLocalMessages] = useState<Message[]>([])

  // Get all messages for the current user
  const { data: messages, isLoading, error, isError } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async (): Promise<Message[]> => {
      if (!isLoggedIn || !user) return []
      
      try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get('http://localhost:8000/messages', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        return response.data
      } catch (error) {
        console.error('Error fetching messages:', error)
        throw error
      }
    },
    enabled: isLoggedIn && !!user,
    refetchInterval: 30000, // Poll every 30 seconds for new messages
  })

  // Add a message manually (for WebSocket messages)
  const addMessage = useCallback((message: Message) => {
    setLocalMessages(prev => {
      // Check if the message already exists
      const exists = [...prev, ...(messages || [])].some(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
    
    // Update cache with the new message
    queryClient.setQueryData(['messages', user?.id], (oldData: Message[] | undefined) => {
      if (!oldData) return [message];
      // Check if the message already exists in the cache
      if (oldData.some(m => m.id === message.id)) return oldData;
      return [...oldData, message];
    });
    
    // Update unread count if needed
    if (!message.read && message.receiver_id === user?.id) {
      queryClient.setQueryData(['unreadMessages', user?.id], (oldCount: number | undefined) => 
        (oldCount || 0) + 1
      );
    }
  }, [messages, queryClient, user]);

  // Get unread message count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadMessages', user?.id],
    queryFn: async (): Promise<number> => {
      if (!isLoggedIn || !user || !messages) return 0
      return messages.filter(message => 
        message.receiver_id === user.id && !message.read
      ).length
    },
    enabled: isLoggedIn && !!user && !!messages,
  })

  // Send a new message
  const sendMessage = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string, content: string }) => {
      if (!isLoggedIn || !user) throw new Error('You must be logged in to send messages')
      
      const token = localStorage.getItem('access_token')
      const response = await axios.post('http://localhost:8000/messages', {
        receiver_id: receiverId,
        content
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })

  // Mark a message as read
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      if (!isLoggedIn || !user) throw new Error('You must be logged in')
      
      const token = localStorage.getItem('access_token')
      const response = await axios.patch(`http://localhost:8000/messages/${messageId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['unreadMessages'] })
    },
  })

  // Mark all messages as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!isLoggedIn || !user) throw new Error('You must be logged in')
      
      const token = localStorage.getItem('access_token')
      const response = await axios.patch('http://localhost:8000/messages/read-all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({ queryKey: ['unreadMessages'] })
    },
  })

  // Combine API fetched messages with local WebSocket messages
  const allMessages = [...(messages || []), ...localMessages].filter((message, index, self) => {
    // Remove duplicate messages (by id)
    return index === self.findIndex(m => m.id === message.id);
  });

  return {
    messages: allMessages,
    unreadCount: unreadCount || 0,
    isLoading,
    error,
    isError,
    sendMessage,
    markAsRead,
    markAllAsRead,
    addMessage
  }
} 