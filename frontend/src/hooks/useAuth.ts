import { create } from 'zustand'
import axios from 'axios'
import { useEffect } from 'react'

interface AuthState {
  user: any
  isLoggedIn: boolean
  loading: boolean
  error: string | null
  login: (token: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: !!localStorage.getItem('access_token'),
  loading: true, // Start with loading true
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
    set({ user: null, isLoggedIn: false, error: null })
  },

  fetchUser: async () => {
    try {
      set({ loading: true, error: null })
      const token = localStorage.getItem('access_token')
      if (!token) {
        set({ isLoggedIn: false, loading: false })
        return
      }

      const response = await axios.get('http://localhost:8000/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
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
  const { fetchUser, isLoggedIn, loading, ...rest } = useAuth()

  useEffect(() => {
    if (isLoggedIn) {
      fetchUser()
    } else {
      useAuth.setState({ loading: false })
    }
  }, [isLoggedIn, fetchUser])

  return { ...rest, isLoggedIn, loading }
}