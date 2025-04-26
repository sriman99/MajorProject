import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuth } from './useAuth'

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

  return {
    messages: messages || [],
    unreadCount: unreadCount || 0,
    isLoading,
    error,
    isError,
    sendMessage,
    markAsRead,
    markAllAsRead
  }
} 