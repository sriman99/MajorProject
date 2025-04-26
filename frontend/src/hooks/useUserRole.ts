import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'

// Define user role types
export type UserRole = 'patient' | 'doctor' | 'admin' | null

// Define permission types based on role
export interface RolePermissions {
  canAccessPatientDashboard: boolean
  canAccessDoctorDashboard: boolean
  canAccessAdminDashboard: boolean
  canSendMessages: boolean
  canReceiveMessages: boolean
  canViewAppointments: boolean
  canManageAppointments: boolean
}

// Helper function to determine role from user data
export const getUserRole = (user: any | null): UserRole => {
  if (!user) return null
  
  if (user.doctor_profile) {
    return 'doctor'
  } else if (user.admin_profile) {
    return 'admin'
  } else {
    return 'patient'
  }
}

// Helper function to get permissions based on role
export const getPermissions = (role: UserRole, isLoggedIn: boolean): RolePermissions => {
  return {
    canAccessPatientDashboard: role === 'patient',
    canAccessDoctorDashboard: role === 'doctor',
    canAccessAdminDashboard: role === 'admin',
    canSendMessages: !!isLoggedIn,
    canReceiveMessages: !!isLoggedIn,
    canViewAppointments: !!isLoggedIn,
    canManageAppointments: role === 'doctor' || role === 'admin',
  }
}

export const useUserRole = () => {
  const { user, isLoggedIn } = useAuth()

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async (): Promise<{ role: UserRole; permissions: RolePermissions }> => {
      // If not logged in or no user, return null role and no permissions
      if (!isLoggedIn || !user) {
        return { 
          role: null, 
          permissions: getPermissions(null, false)
        }
      }
      
      // Determine role from user data
      const role = getUserRole(user)
      
      // Get permissions based on role
      const permissions = getPermissions(role, isLoggedIn)
      
      return { role, permissions }
    },
    // Important: Use initialData to provide cached role data immediately
    initialData: () => {
      if (!isLoggedIn || !user) {
        return { 
          role: null, 
          permissions: getPermissions(null, false)
        }
      }
      
      const role = getUserRole(user)
      const permissions = getPermissions(role, isLoggedIn)
      
      return { role, permissions }
    },
    enabled: true, // Always enable this query
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
} 