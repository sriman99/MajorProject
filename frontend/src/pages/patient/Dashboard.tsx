import { LayoutDashboard, Calendar, MessageCircle, Video, User, Settings, FileText, Activity, Heart, Thermometer, Stethoscope, Wind, ActivitySquare, Droplets, Brain } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface HealthMetric {
  title: string;
  value: string;
  unit: string;
  trend: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  range?: {
    min: number;
    max: number;
  };
}

// Mock data
const stats = [
  { title: "Upcoming Appointments", value: "3", change: "+1", icon: Calendar },
  { title: "Completed Consultations", value: "12", change: "+4", icon: Stethoscope },
  { title: "Health Records", value: "8", change: "+2", icon: FileText },
  { title: "Messages", value: "5", change: "+3", icon: MessageCircle },
]

const healthMetrics = [
  { 
    title: "Heart Rate", 
    value: "72", 
    unit: "bpm", 
    trend: "normal", 
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50",
    description: "Resting heart rate",
    range: { min: 60, max: 100 }
  },
  { 
    title: "Temperature", 
    value: "98.6", 
    unit: "°F", 
    trend: "normal", 
    icon: Thermometer,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    description: "Body temperature",
    range: { min: 97, max: 99 }
  },
  { 
    title: "Activity Level", 
    value: "85", 
    unit: "%", 
    trend: "high", 
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    description: "Daily activity goal",
    range: { min: 0, max: 100 }
  },
  { 
    title: "Respiratory Rate", 
    value: "16", 
    unit: "breaths/min", 
    trend: "normal", 
    icon: Wind,
    color: "text-green-500",
    bgColor: "bg-green-50",
    description: "Breathing rate",
    range: { min: 12, max: 20 }
  },
  { 
    title: "Blood Pressure", 
    value: "120/80", 
    unit: "mmHg", 
    trend: "normal", 
    icon: ActivitySquare,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    description: "Systolic/Diastolic",
    range: { min: 90, max: 140 }
  },
  { 
    title: "Oxygen Level", 
    value: "98", 
    unit: "%", 
    trend: "normal", 
    icon: Droplets,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    description: "Blood oxygen",
    range: { min: 95, max: 100 }
  },
  { 
    title: "Mental State", 
    value: "Good", 
    unit: "", 
    trend: "stable", 
    icon: Brain,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    description: "Mental wellness",
    range: { min: 0, max: 100 }
  },
]

const upcomingAppointments = [
  { 
    doctor: "Dr. Sarah Johnson", 
    time: "10:00 AM", 
    type: "Video Consultation",
    status: "Confirmed",
    duration: "30 mins",
    symptoms: ["Cough", "Shortness of breath"]
  },
  { 
    doctor: "Dr. Michael Chen", 
    time: "2:30 PM", 
    type: "In-Person",
    status: "Pending",
    duration: "45 mins",
    symptoms: ["Chest pain", "Fatigue"]
  },
  { 
    doctor: "Dr. A Anitha", 
    time: "4:00 PM", 
    type: "Video Consultation",
    status: "Confirmed",
    duration: "30 mins",
    symptoms: ["Wheezing", "Cough"]
  },
]

const healthRecords = [
  { 
    title: "Respiratory Analysis", 
    date: "2024-03-15", 
    status: "Completed",
    type: "Test Results",
    doctor: "Dr. Sarah Johnson"
  },
  { 
    title: "Blood Test Results", 
    date: "2024-03-10", 
    status: "Completed",
    type: "Lab Report",
    doctor: "Dr. Michael Chen"
  },
  { 
    title: "X-Ray Report", 
    date: "2024-03-05", 
    status: "Completed",
    type: "Imaging",
    doctor: "Dr. A Anitha"
  },
]

const recentActivities = [
  { action: "Appointment Booked", time: "2 hours ago", doctor: "Dr. Sarah Johnson" },
  { action: "Test Results Uploaded", time: "1 day ago", doctor: "Dr. Michael Chen" },
  { action: "Prescription Updated", time: "2 days ago", doctor: "Dr. A Anitha" },
]

const sidebarItems = [
  { title: "Dashboard", href: "/patient/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { title: "Appointments", href: "/patient/appointments", icon: <Calendar className="w-5 h-5" /> },
  { title: "Messages", href: "/patient/messages", icon: <MessageCircle className="w-5 h-5" /> },
  { title: "Video Calls", href: "/patient/video-calls", icon: <Video className="w-5 h-5" /> },
  { title: "Health Records", href: "/patient/health-records", icon: <FileText className="w-5 h-5" /> },
  { title: "Profile", href: "/patient/profile", icon: <User className="w-5 h-5" /> },
  { title: "Settings", href: "/patient/settings", icon: <Settings className="w-5 h-5" /> },
]

export default function PatientDashboard() {
  const navigate = useNavigate()
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleScheduleAppointment = () => {
    navigate("/appointments")
  }

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  const calculateProgress = (metric: HealthMetric) => {
    if (!metric.range) return 0;
    
    // Handle special cases
    if (metric.title === "Blood Pressure") {
      const [systolic, diastolic] = metric.value.split('/').map(Number);
      const normalRange = 120; // Normal systolic pressure
      return Math.min(100, Math.max(0, (systolic / normalRange) * 100));
    }
    
    if (metric.title === "Mental State") {
      // Convert qualitative state to percentage
      const states: Record<string, number> = { "Good": 80, "Fair": 60, "Poor": 40 };
      return states[metric.value] || 50;
    }

    // For numerical values
    const value = parseFloat(metric.value);
    if (isNaN(value)) return 0;
    
    const { min, max } = metric.range;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, John!</h1>
            <p className="text-muted-foreground">Here's what's happening with your health today</p>
          </div>
          <Button onClick={handleScheduleAppointment}>Schedule New Appointment</Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600">
                    {stat.change} from last week
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Enhanced Health Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {healthMetrics.map((metric) => {
                  const Icon = metric.icon
                  const progress = calculateProgress(metric);

                  return (
                    <div 
                      key={metric.title}
                      className={`p-4 rounded-lg ${metric.bgColor} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${metric.bgColor}`}>
                            <Icon className={`h-5 w-5 ${metric.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium">{metric.title}</h3>
                            <p className="text-xs text-gray-500">{metric.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${metric.color}`}>
                            {metric.value}
                            <span className="text-xs ml-1">{metric.unit}</span>
                          </p>
                        </div>
                      </div>
                      {/* {metric.title !== "Mental State" && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{metric.range?.min}</span>
                            <span>{metric.range?.max}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${metric.color.replace('text-', 'bg-')} transition-all duration-500`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )} */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.trend === "normal" 
                            ? "bg-green-100 text-green-800" 
                            : metric.trend === "high" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {metric.trend}
                        </span>
                        <span className="text-xs text-gray-500">
                          Last updated: 2 mins ago
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{appointment.doctor}</h3>
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
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === "Confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Health Records */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthRecords.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{record.title}</h3>
                      <p className="text-sm text-gray-500">{record.date}</p>
                      <p className="text-xs text-gray-500">{record.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-green-600">{record.status}</span>
                      <p className="text-xs text-gray-500">{record.doctor}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleViewRecord(record)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{activity.action}</h3>
                      <p className="text-sm text-gray-500">{activity.doctor}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Health Record Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
            <DialogDescription>
              Detailed information about your health record
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 text-sm font-medium">Date</div>
                <div className="col-span-3">{selectedRecord.date}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 text-sm font-medium">Type</div>
                <div className="col-span-3">{selectedRecord.type}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 text-sm font-medium">Doctor</div>
                <div className="col-span-3">{selectedRecord.doctor}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 text-sm font-medium">Status</div>
                <div className="col-span-3">
                  <span className="text-green-600">{selectedRecord.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 text-sm font-medium">Notes</div>
                <div className="col-span-3 text-sm text-gray-500">
                  This is a detailed description of the health record. It includes all relevant information about the test results, observations, and recommendations from the doctor.
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
} 