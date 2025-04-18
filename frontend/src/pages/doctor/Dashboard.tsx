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

// Mock data
const stats = [
  { 
    title: "Today's Appointments", 
    value: "8", 
    change: "+2", 
    icon: Calendar,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  { 
    title: "Active Patients", 
    value: "24", 
    change: "+5", 
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  { 
    title: "Consultation Time", 
    value: "4.2", 
    unit: "hrs", 
    change: "-0.5", 
    icon: Clock,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  { 
    title: "Patient Satisfaction", 
    value: "94", 
    unit: "%", 
    change: "+2", 
    icon: TrendingUp,
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
]

const upcomingAppointments = [
  { 
    patient: "John Smith", 
    time: "10:00 AM", 
    type: "Video Consultation",
    status: "Confirmed",
    duration: "30 mins",
    symptoms: ["Cough", "Fever"],
    priority: "high"
  },
  { 
    patient: "Sarah Johnson", 
    time: "11:30 AM", 
    type: "In-Person",
    status: "Pending",
    duration: "45 mins",
    symptoms: ["Chest pain", "Shortness of breath"],
    priority: "urgent"
  },
  { 
    patient: "Michael Brown", 
    time: "2:00 PM", 
    type: "Video Consultation",
    status: "Confirmed",
    duration: "30 mins",
    symptoms: ["Wheezing", "Cough"],
    priority: "medium"
  },
]

const recentPatients = [
  { 
    name: "Emma Wilson", 
    lastVisit: "2 days ago", 
    condition: "Asthma",
    status: "Improving",
    nextAppointment: "Next week"
  },
  { 
    name: "David Lee", 
    lastVisit: "3 days ago", 
    condition: "COPD",
    status: "Stable",
    nextAppointment: "2 weeks"
  },
  { 
    name: "Lisa Chen", 
    lastVisit: "1 week ago", 
    condition: "Bronchitis",
    status: "Recovered",
    nextAppointment: "None"
  },
]

const alerts = [
  { 
    type: "critical", 
    message: "Patient John Smith requires immediate attention", 
    time: "5 mins ago",
    icon: AlertCircle
  },
  { 
    type: "warning", 
    message: "Test results pending for Sarah Johnson", 
    time: "1 hour ago",
    icon: AlertCircle
  },
  { 
    type: "info", 
    message: "New patient registration completed", 
    time: "2 hours ago",
    icon: CheckCircle2
  },
]

export default function DoctorDashboard() {
  const navigate = useNavigate()
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
  const [filteredAppointments, setFilteredAppointments] = useState(upcomingAppointments)
  const [patients, setPatients] = useState(recentPatients)

  useEffect(() => {
    // Filter appointments based on search query and priority
    const filtered = upcomingAppointments.filter(appointment => {
      const matchesSearch = appointment.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = filterPriority === "all" || appointment.priority === filterPriority
      return matchesSearch && matchesPriority
    })
    setFilteredAppointments(filtered)
  }, [searchQuery, filterPriority])

  const handleStartConsultation = (appointment: any) => {
    // Here you would typically make an API call to start the consultation
    console.log("Starting consultation for:", appointment)
    navigate(`/doctor/consultation/${appointment.id}`)
  }

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.condition) {
      setPatients([...patients, { ...newPatient, lastVisit: "Just now" }])
      setNewPatient({ name: "", condition: "", status: "Stable", nextAppointment: "" })
      setShowAddPatient(false)
    }
  }

  const handleViewSchedule = () => {
    navigate("/doctor/schedule")
  }

  const handleViewPatient = (patient: any) => {
    navigate(`/doctor/patients/${patient.id}`)
  }

  const handleViewStats = () => {
    navigate("/doctor/statistics")
  }

  const handleQuickConsultation = () => {
    navigate("/doctor/consultation/new")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, Dr. Smith!</h1>
            <p className="text-muted-foreground">Here's your daily overview</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="relative" onClick={() => setShowNotifications(true)}>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            </Button>
            <Button variant="outline" onClick={() => setShowSchedule(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              View Schedule
            </Button>
            <Button onClick={handleQuickConsultation}>
              <Stethoscope className="w-4 h-4 mr-2" />
              Quick Consultation
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card 
                key={stat.title} 
                className={`${stat.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                onClick={handleViewStats}
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
          {/* Upcoming Appointments */}
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
              <div className="space-y-4">
                {filteredAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{appointment.patient}</h3>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                      <div className="flex gap-2 mt-1">
                        {appointment.symptoms.map((symptom, i) => (
                          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <p className="text-sm text-gray-500">{appointment.duration}</p>
                      <span className={`text-xs px-2 py-1 mr-2 rounded-full ${
                        appointment.priority === "urgent" 
                          ? "bg-red-100 text-red-800" 
                          : appointment.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                      }`}>
                        {appointment.priority}
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
              <div className="space-y-4">
                {patients.map((patient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => handleViewPatient(patient)}
                  >
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.condition}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === "Improving" 
                          ? "bg-green-100 text-green-800" 
                          : patient.status === "Stable"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}>
                        {patient.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Next: {patient.nextAppointment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => {
                const Icon = alert.icon
                return (
                  <div
                    key={index}
                    className={`flex items-start p-4 rounded-lg ${
                      alert.type === "critical" 
                        ? "bg-red-50" 
                        : alert.type === "warning"
                          ? "bg-yellow-50"
                          : "bg-blue-50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-1 mr-3 ${
                      alert.type === "critical" 
                        ? "text-red-500" 
                        : alert.type === "warning"
                          ? "text-yellow-500"
                          : "text-blue-500"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card> */}
      </div>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notifications & Alerts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start p-4 rounded-lg ${
                  alert.type === "critical" 
                    ? "bg-red-50" 
                    : alert.type === "warning"
                      ? "bg-yellow-50"
                      : "bg-blue-50"
                }`}
              >
                <alert.icon className={`h-5 w-5 mt-1 mr-3 ${
                  alert.type === "critical" 
                    ? "text-red-500" 
                    : alert.type === "warning"
                      ? "text-yellow-500"
                      : "text-blue-500"
                }`} />
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Doctor's Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{appointment.patient}</h3>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
                  <p className="text-sm text-gray-500">{appointment.time}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.priority === "urgent" 
                      ? "bg-red-100 text-red-800" 
                      : appointment.priority === "high"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                  }`}>
                    {appointment.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
              <Button onClick={handleAddPatient}>
                Add Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 