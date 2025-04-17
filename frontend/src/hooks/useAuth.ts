import { useQuery, useQueryClient } from "@tanstack/react-query"

interface AuthState {
  isLoggedIn: boolean
  token: string | null
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: auth } = useQuery<AuthState>({
    queryKey: ['auth'],
    queryFn: () => ({
      isLoggedIn: !!localStorage.getItem('access_token'),
      token: localStorage.getItem('access_token')
    }),
    staleTime: Infinity
  })

  const login = (token: string) => {
    localStorage.setItem('access_token', token)
    queryClient.setQueryData(['auth'], {
      isLoggedIn: true,
      token
    })
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    queryClient.setQueryData(['auth'], {
      isLoggedIn: false,
      token: null
    })
  }

  return {
    isLoggedIn: auth?.isLoggedIn ?? false,
    token: auth?.token ?? null,
    login,
    logout
  }
} 