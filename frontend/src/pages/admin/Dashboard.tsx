import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { adminApi, type AdminStats, type User, type EnrichedAppointment } from "@/services/api"
import { toast } from "sonner"
import {
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  Activity,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Trash2
} from "lucide-react"

interface DashboardData {
  stats: AdminStats | null
  users: User[]
  appointments: EnrichedAppointment[]
  usersTotal: number
  appointmentsTotal: number
}

export default function AdminDashboard() {
  const { user, loading: authLoading, error: authError } = useAuthWithFetch()
  const [data, setData] = useState<DashboardData>({
    stats: null,
    users: [],
    appointments: [],
    usersTotal: 0,
    appointmentsTotal: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      setLoading(true)

      // Fetch all data in parallel
      const [statsData, usersData, appointmentsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 10 }),
        adminApi.getAppointments({ limit: 10 })
      ])

      setData({
        stats: statsData,
        users: usersData.users,
        appointments: appointmentsData.appointments,
        usersTotal: usersData.total,
        appointmentsTotal: appointmentsData.total
      })
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err)
      setError(err.response?.data?.detail || "Failed to load dashboard data")
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    toast.success("Dashboard refreshed")
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      await adminApi.updateUserStatus(userId, newStatus)
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)

      // Refresh users list
      const usersData = await adminApi.getUsers({ limit: 10, search: searchQuery, role: roleFilter })
      setData(prev => ({
        ...prev,
        users: usersData.users,
        usersTotal: usersData.total
      }))
    } catch (err: any) {
      console.error("Failed to update user status:", err)
      toast.error(err.response?.data?.detail || "Failed to update user status")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action will deactivate the account.")) {
      return
    }

    try {
      await adminApi.deleteUser(userId)
      toast.success("User deleted successfully")

      // Refresh users list
      const usersData = await adminApi.getUsers({ limit: 10, search: searchQuery, role: roleFilter })
      setData(prev => ({
        ...prev,
        users: usersData.users,
        usersTotal: usersData.total
      }))
    } catch (err: any) {
      console.error("Failed to delete user:", err)
      toast.error(err.response?.data?.detail || "Failed to delete user")
    }
  }

  const handleSearchUsers = async () => {
    try {
      const usersData = await adminApi.getUsers({
        limit: 10,
        search: searchQuery,
        role: roleFilter
      })
      setData(prev => ({
        ...prev,
        users: usersData.users,
        usersTotal: usersData.total
      }))
    } catch (err: any) {
      console.error("Failed to search users:", err)
      toast.error("Failed to search users")
    }
  }

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchDashboardData()
    }
  }, [user])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (user && user.role === "admin") {
        handleSearchUsers()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, roleFilter])

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (authError || error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{authError || error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
            <p className="text-gray-600">Please log in to view your dashboard</p>
            <Button className="mt-4" onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "doctor":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "user":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.full_name || 'Admin'}</h1>
            <p className="text-muted-foreground">Administrator Dashboard</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Admin Info Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Role:</span>{' '}
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        {data.stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.total_users}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.stats.total_doctors} doctors, {data.stats.total_patients} patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.total_doctors}</div>
                <p className="text-xs text-green-600 mt-1">
                  Active in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.active_appointments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.stats.pending_appointments} pending, {data.stats.confirmed_appointments} confirmed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.stats.system_health.toFixed(0)}%</div>
                <p className="text-xs text-green-600 mt-1">
                  {data.stats.system_health >= 90 ? 'Excellent' : data.stats.system_health >= 70 ? 'Good' : 'Needs Attention'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>User Management</span>
                <UserCheck className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="user">Patient</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.users.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                ) : (
                  data.users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getRoleBadgeColor(u.role)} variant="outline">
                            {u.role}
                          </Badge>
                          <Badge variant="outline" className={u.is_active ? "bg-green-50 text-green-700 border-green-300" : "bg-gray-50 text-gray-700 border-gray-300"}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                          title={u.is_active ? "Deactivate user" : "Activate user"}
                        >
                          {u.is_active ? (
                            <XCircle className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {data.usersTotal > 10 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Showing 10 of {data.usersTotal} users
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Appointments</span>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.appointments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No appointments found</p>
                ) : (
                  data.appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {appointment.patient_name} - {appointment.doctor_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.date} at {appointment.time}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          Reason: {appointment.reason}
                        </p>
                        <Badge className={getStatusBadgeColor(appointment.status)} variant="outline">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {data.appointmentsTotal > 10 && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Showing 10 of {data.appointmentsTotal} appointments
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Stats Summary */}
        {data.stats && (
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-700">{data.stats.pending_appointments}</p>
                  <p className="text-xs text-yellow-600 mt-1">Pending</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{data.stats.confirmed_appointments}</p>
                  <p className="text-xs text-blue-600 mt-1">Confirmed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{data.stats.completed_appointments}</p>
                  <p className="text-xs text-green-600 mt-1">Completed</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-700">{data.stats.cancelled_appointments}</p>
                  <p className="text-xs text-red-600 mt-1">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
