import { create } from 'zustand'
import axios from 'axios'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface AuthState {
  user: any
  isLoggedIn: boolean
  loading: boolean
  error: string | null
  login: (token: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

// Get stored user from local storage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch (error) {
    console.error('Failed to parse stored user:', error)
    return null
  }
}

export const useAuth = create<AuthState>((set) => ({
  user: getStoredUser(),
  isLoggedIn: !!localStorage.getItem('access_token'),
  loading: !!localStorage.getItem('access_token'), // Only start loading if there's a token
  error: null,

  login: async (token: string) => {
    try {
      set({ loading: true, error: null })
      localStorage.setItem('access_token', token)
      set({ isLoggedIn: true })
      // Fetch user data after login
      await useAuth.getState().fetchUser()
    } catch (error) {
      set({ error: 'Login failed', loading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    set({ user: null, isLoggedIn: false, error: null })
  },

  fetchUser: async () => {
    try {
      set({ loading: true, error: null })
      const token = localStorage.getItem('access_token')
      if (!token) {
        set({ isLoggedIn: false, loading: false })
        localStorage.removeItem('user')
        return
      }

      const response = await axios.get('http://localhost:8000/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(response.data))
      set({ user: response.data, loading: false })
    } catch (error) {
      console.error('Error fetching user:', error)
      set({ error: 'Failed to fetch user data', loading: false })
      useAuth.getState().logout()
    }
  }
}))

// Custom hook to handle initial data fetching
export const useAuthWithFetch = () => {
  const { fetchUser, isLoggedIn, loading, logout, ...rest } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLoggedIn) {
      fetchUser()
    } else {
      useAuth.setState({ loading: false })
    }
  }, [isLoggedIn])

  // Enhanced logout function that also invalidates query cache
  const enhancedLogout = () => {
    logout()
    // Invalidate all queries when user logs out
    queryClient.clear()
  }

  return { 
    ...rest, 
    isLoggedIn, 
    loading, 
    fetchUser,
    logout: enhancedLogout 
  }
}