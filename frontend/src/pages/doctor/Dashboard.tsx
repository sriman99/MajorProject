import { Calendar, Stethoscope, Clock, Users, CheckCircle2, Plus, RefreshCw } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { doctorsApi, appointmentsApi, type DoctorStats, type PatientInfo, type AppointmentWithPatient } from "@/services/api"
import { StaggerContainer, StaggerItem, FadeIn, AnimatedCounter } from "@/components/ui/animated"

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user, loading: userLoading, error: userError } = useAuthWithFetch()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // State for API data
  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentWithPatient[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentWithPatient[]>([])
  const [recentPatients, setRecentPatients] = useState<PatientInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch appointment data
  const fetchDoctorData = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Get today's date
      const today = new Date().toISOString().split('T')[0]

      // Fetch all data in parallel
      const [statsData, scheduleData, patientsData] = await Promise.all([
        doctorsApi.getMyStats(),
        doctorsApi.getMySchedule(today, today), // Get today's appointments
        doctorsApi.getMyPatients()
      ])

      // Update state
      setStats(statsData)
      setTodaysAppointments(scheduleData)
      setFilteredAppointments(scheduleData)
      setRecentPatients(patientsData.slice(0, 5)) // Show only top 5 recent patients

      if (showToast) {
        toast.success('Dashboard refreshed successfully')
      }
    } catch (err) {
      console.error('Error fetching doctor data:', err)
      const errorMessage = 'Failed to load doctor data. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh data
  const handleRefresh = () => {
    fetchDoctorData(true)
  }

  useEffect(() => {
    if (user && user.role === 'doctor') {
      fetchDoctorData()
    }
  }, [user])

  useEffect(() => {
    // Filter appointments based on search query and status
    if (todaysAppointments.length) {
      const filtered = todaysAppointments.filter(appointment => {
        // Check if patient info exists and matches search
        const patientName = appointment.patient?.name || '';
        const reason = appointment.reason || '';

        const matchesSearch =
          patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reason.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by status
        const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;

        return matchesSearch && matchesStatus;
      })
      setFilteredAppointments(filtered)
    }
  }, [searchQuery, filterStatus, todaysAppointments])

  const handleStartConsultation = (appointment: AppointmentWithPatient) => {
    console.log("Starting consultation for:", appointment)
    navigate(`/appointments/manage`)
  }

  const handleViewSchedule = () => {
    navigate("/appointments/manage")
  }

  const handleViewPatient = (patientId: string) => {
    navigate('/appointments/manage')
  }

  const handleManageAppointments = () => {
    navigate("/appointments/manage")
  }

  const _handleUpdateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await appointmentsApi.updateStatus(appointmentId, status)
      toast.success(`Appointment ${status} successfully`)
      // Refresh data
      await fetchDoctorData()
    } catch (err) {
      console.error('Error updating appointment:', err)
      toast.error('Failed to update appointment')
    }
  }
  void _handleUpdateAppointmentStatus

  if (userLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-[300px]" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (userError || error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{userError || error}</p>
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
            <Button className="mt-4" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Ensure arrays exist and have default values
  const specialties = user?.doctor_profile?.specialties || []
  const languages = user?.doctor_profile?.languages || []
  const qualifications = user?.doctor_profile?.qualifications || "Not specified"
  const name = user?.full_name || user?.doctor_profile?.name || "Doctor"

  // Generate stats data from real data
  const statsCards = [
    {
      title: "Today's Appointments",
      value: String(stats?.todays_appointments || 0),
      change: "+2",
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Patients",
      value: String(stats?.total_patients || 0),
      change: "+5",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Appointments",
      value: String(stats?.pending_appointments || 0),
      change: "-3",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Completed This Week",
      value: String(stats?.completed_this_week || 0),
      change: "+8",
      icon: CheckCircle2,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <FadeIn>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Dr. {name}!</h1>
              <p className="text-muted-foreground">Here's your practice overview</p>
            </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handleViewSchedule}
            >
              <Calendar className="h-5 w-5 mr-2" />
              View Schedule
            </Button>
            <Button
              onClick={handleManageAppointments}
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              Manage Appointments
            </Button>
          </div>
        </div>
        </FadeIn>

        {/* Doctor Info Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{qualifications}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {specialties.length > 0 ? (
                  specialties.map((specialty: string) => (
                    <span key={specialty} className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      {specialty}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No specialties specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {languages.length > 0 ? (
                  languages.map((language: string) => (
                    <span key={language} className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                      {language}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No languages specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" delay={0.1}>
          {statsCards.map((stat) => {
            const Icon = stat.icon
            return (
              <StaggerItem key={stat.title}>
                <Card
                  className={`${stat.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${stat.color}`}>
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={Number(stat.value)} />
                    </div>
                    <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from yesterday
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Charts Section */}
        <FadeIn delay={0.3} className="grid gap-4 md:grid-cols-2">
          {/* Appointment Status Distribution */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Appointment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Today's Appointments", value: stats?.todays_appointments || 0 },
                      { name: "Pending Appointments", value: stats?.pending_appointments || 0 },
                      { name: "Completed This Week", value: stats?.completed_this_week || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Performance */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Practice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    {
                      name: "Patients",
                      value: stats?.total_patients || 0,
                    },
                    {
                      name: "Appointments",
                      value: stats?.todays_appointments || 0,
                    },
                    {
                      name: "Completed",
                      value: stats?.completed_this_week || 0,
                    },
                  ]}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4} className="grid gap-4 md:grid-cols-2">
          {/* Today's Appointments */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Appointments</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px]"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {appointment.patient?.name || `Patient (ID: ${appointment.patient_id})`}
                        </h3>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {appointment.reason}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 mr-2 rounded-full ${
                          appointment.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                        }`}>
                          {appointment.status}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 hover:bg-primary hover:text-white transition-colors"
                          onClick={() => handleStartConsultation(appointment)}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <Calendar className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500">No appointments for today</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleManageAppointments}
                  >
                    View All Appointments
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Patients</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/appointments/manage')}>
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </CardHeader>
            <CardContent>
              {recentPatients.length > 0 ? (
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                        <p className="text-xs text-gray-400">{patient.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium">Last visit:</p>
                        <p className="text-sm text-gray-700">
                          {patient.last_appointment_date
                            ? new Date(patient.last_appointment_date).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <Users className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500">No patients found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate('/appointments/manage')}
                  >
                    Book First Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

    </DashboardLayout>
  )
} 