import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, UserCircle, AlertCircle } from "lucide-react"
import { AppointmentStatusUpdate } from "@/components/AppointmentStatusUpdate"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { toast } from "sonner"

interface Appointment {
  id: string
  doctor_id: string
  patient_id: string
  date: string
  time: string
  reason: string
  status: string
  created_at: string
  doctor?: {
    name: string
  }
}

export default function AppointmentManagement() {
  const { user } = useAuthWithFetch()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setError("Authentication token missing. Please log in again.")
        return
      }
      
      const response = await axios.get('http://localhost:8000/appointments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setAppointments(response.data)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setError('Failed to load appointments. Please try again.')
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments = () => {
    if (activeTab === "all") return appointments
    return appointments.filter(appointment => appointment.status === activeTab)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Appointments</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchAppointments}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Appointment Management</h2>
          <p className="text-muted-foreground">
            View and manage your appointments
          </p>
        </div>

        <Tabs 
          defaultValue="all" 
          className="space-y-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="all">All Appointments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredAppointments().length > 0 ? (
              filteredAppointments().map((appointment) => (
                <Card key={appointment.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          Appointment with {appointment.doctor?.name || `Doctor (ID: ${appointment.doctor_id})`}
                        </CardTitle>
                        <CardDescription>
                          Appointment ID: {appointment.id}
                        </CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="text-sm">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="text-sm">{appointment.reason}</span>
                        </div>
                        <div className="flex items-center">
                          <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {user?.role === 'doctor' ? 'Patient ID: ' + appointment.patient_id : ''}
                            {user?.role === 'user' ? 'Doctor ID: ' + appointment.doctor_id : ''}
                            {!user ? 'Unknown' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3 flex flex-col items-end justify-end">
                        <p className="text-sm text-gray-600">
                          Created: {new Date(appointment.created_at).toLocaleDateString()} at {' '}
                          {new Date(appointment.created_at).toLocaleTimeString()}
                        </p>
                        <div className="mt-auto pt-4 w-full max-w-[200px]">
                          <AppointmentStatusUpdate 
                            appointmentId={appointment.id}
                            currentStatus={appointment.status}
                            onStatusUpdate={fetchAppointments}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No appointments found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {activeTab === "all"
                    ? "You don't have any appointments yet."
                    : `You don't have any ${activeTab} appointments.`}
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setActiveTab("all")}
                >
                  View all appointments
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 