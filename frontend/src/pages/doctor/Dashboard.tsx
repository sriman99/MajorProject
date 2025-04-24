import { LayoutDashboard, Calendar, MessageCircle, Video, User, Settings, FileText, Stethoscope, Clock, Users, Activity, TrendingUp, AlertCircle, CheckCircle2, XCircle, Bell, Plus, Search, Filter, X } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { toast } from "sonner"

// Define interfaces
interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  date: string
  time: string
  reason: string
  status: string
  created_at: string
  patient?: {
    name: string
  }
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user, loading: userLoading, error: userError } = useAuthWithFetch()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [newPatient, setNewPatient] = useState({
    name: "",
    condition: "",
    status: "Stable",
    nextAppointment: ""
  })
  
  // State for API data
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardStats, setDashboardStats] = useState({
    todaysAppointments: 0,
    activePatients: 0,
    consultationTime: 0,
    patientSatisfaction: 95
  })

  // Fetch appointment data
  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setError("Authentication token missing. Please log in again.")
        return
      }
      
      // Fetch appointments
      const appointmentsResponse = await axios.get('http://localhost:8000/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Process appointments
      const allAppointments = appointmentsResponse.data;
      setAppointments(allAppointments)
      
      // Get today's date in the format used by the API (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0]
      
      // Filter appointments for today
      const appointmentsToday = allAppointments.filter(
        (app: Appointment) => app.date === today
      )
      
      setTodaysAppointments(appointmentsToday)
      setFilteredAppointments(appointmentsToday)
      
      // Calculate dashboard stats
      const confirmed = allAppointments.filter(
        (app: Appointment) => app.status === 'confirmed'
      ).length
      
      const completed = allAppointments.filter(
        (app: Appointment) => app.status === 'completed'
      ).length
      
      // Get unique patient count
      const uniquePatients = new Set(
        allAppointments.map((app: Appointment) => app.patient_id)
      )
      
      // Estimate consultation time (30 mins per appointment)
      const estimatedTime = Math.round((appointmentsToday.length * 30) / 60 * 10) / 10
      
      setDashboardStats({
        todaysAppointments: appointmentsToday.length,
        activePatients: uniquePatients.size,
        consultationTime: estimatedTime,
        patientSatisfaction: 95 // This would ideally come from a real rating system
      })
      
    } catch (err) {
      console.error('Error fetching doctor data:', err)
      setError('Failed to load doctor data. Please try again.')
      toast.error('Failed to load doctor data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDoctorData()
    }
  }, [user])

  useEffect(() => {
    // Filter appointments based on search query
    if (todaysAppointments.length) {
      const filtered = todaysAppointments.filter(appointment => {
        // Check if patient info exists and matches search
        const patientName = appointment.patient?.name || '';
        const patientId = appointment.patient_id || '';
        const reason = appointment.reason || '';
        
        const matchesSearch = 
          patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reason.toLowerCase().includes(searchQuery.toLowerCase());
        
        // For priority filtering, we would need to add priority to the API response
        // Here we'll just use a basic filter on status for demo
        const matchesPriority = filterPriority === "all" || (
          filterPriority === "urgent" ? appointment.status === "pending" :
          filterPriority === "high" ? appointment.status === "confirmed" :
          true
        );
        
        return matchesSearch && matchesPriority;
      })
      setFilteredAppointments(filtered)
    }
  }, [searchQuery, filterPriority, todaysAppointments])

  const handleStartConsultation = (appointment: Appointment) => {
    // Here you would start a consultation
    console.log("Starting consultation for:", appointment)
    navigate(`/doctor/consultation/${appointment.id}`)
  }
  
  const handleViewSchedule = () => {
    navigate("/appointments/manage")
  }

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor/patients/${patientId}`)
  }

  const handleManageAppointments = () => {
    navigate("/appointments/manage")
  }

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
  const stats = [
    { 
      title: "Today's Appointments", 
      value: String(dashboardStats.todaysAppointments), 
      change: "+2", 
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    { 
      title: "Active Patients", 
      value: String(dashboardStats.activePatients), 
      change: "+5", 
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    { 
      title: "Consultation Time", 
      value: String(dashboardStats.consultationTime), 
      unit: "hrs", 
      change: "-0.5", 
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    { 
      title: "Patient Satisfaction", 
      value: String(dashboardStats.patientSatisfaction), 
      unit: "%", 
      change: "+2", 
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Dr. {name}!</h1>
            <p className="text-muted-foreground">Here's your practice overview</p>
          </div>
          <div className="flex items-center gap-3">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card 
                key={stat.title} 
                className={`${stat.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${stat.color}`}>
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}{stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}</div>
                  <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from yesterday
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
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
              <Button variant="outline" size="sm" onClick={() => setShowAddPatient(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {/* Show unique patients from appointments */}
                  {Array.from(new Set(appointments.map(a => a.patient_id)))
                    .slice(0, 5)
                    .map((patientId, index) => {
                      const patientAppointments = appointments.filter(a => a.patient_id === patientId);
                      const latestAppointment = patientAppointments.sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                      )[0];
                      
                      return (
                        <div
                          key={patientId}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                          onClick={() => handleViewPatient(patientId)}
                        >
                          <div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {latestAppointment.patient?.name || `Patient ${index + 1}`}
                            </h3>
                            <p className="text-sm text-gray-500">{latestAppointment.reason}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              latestAppointment.status === "completed" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {latestAppointment.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Last visit: {new Date(latestAppointment.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <Users className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-gray-500">No patients found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Patient Dialog */}
      <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Patient Name</label>
              <Input
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                placeholder="Enter patient name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Condition</label>
              <Input
                value={newPatient.condition}
                onChange={(e) => setNewPatient({ ...newPatient, condition: e.target.value })}
                placeholder="Enter patient condition"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={newPatient.status}
                onValueChange={(value) => setNewPatient({ ...newPatient, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stable">Stable</SelectItem>
                  <SelectItem value="Improving">Improving</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Next Appointment</label>
              <Input
                type="date"
                value={newPatient.nextAppointment}
                onChange={(e) => setNewPatient({ ...newPatient, nextAppointment: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddPatient(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success("This feature would connect to the patient registration API");
                setShowAddPatient(false);
              }}>
                Add Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 