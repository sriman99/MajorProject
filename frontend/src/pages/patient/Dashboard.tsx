import { Calendar, MessageCircle, FileText, Stethoscope, Wind, Plus, CreditCard, Clipboard, Activity } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { appointmentsApi, analysisApi } from "@/services/api"
import type { Appointment as ApiAppointment, Analysis as ApiAnalysis } from "@/services/api"

// Suppress unused import warnings
void [Calendar, Stethoscope, FileText, MessageCircle]


// Add interfaces for API data
interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
  doctor?: {
    name: string;
  };
}

interface Analysis {
  id: string;
  user_id: string;
  file_path: string;
  analysis_type: string;
  status: string;
  message: string;
  details: string[];
  created_at: string;
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user, loading, error } = useAuthWithFetch()
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    upcomingAppointments: 0,
    completedConsultations: 0,
    healthRecords: 0,
    messages: 0
  })
  const [loadingData, setLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Fetch appointments and analyses using API service
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);
        setDataError(null);

        // Fetch appointments and analyses in parallel
        const [appointmentsData, analysesData] = await Promise.all([
          appointmentsApi.getAll(),
          analysisApi.getAll()
        ]);

        // Set state with fetched data
        setAppointments(appointmentsData as any);
        setAnalyses(analysesData as any);

        // Update dashboard stats
        const upcomingAppointments = appointmentsData.filter(
          (app) => app.status !== 'completed' && app.status !== 'cancelled'
        ).length;

        const completedConsultations = appointmentsData.filter(
          (app) => app.status === 'completed'
        ).length;

        setDashboardStats({
          upcomingAppointments,
          completedConsultations,
          healthRecords: analysesData.length,
          messages: 0
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setAppointments([]);
        setAnalyses([]);
        setDashboardStats({
          upcomingAppointments: 0,
          completedConsultations: 0,
          healthRecords: 0,
          messages: 0
        });
        toast.error('Could not load dashboard data. Please try again later.');
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleScheduleAppointment = () => {
    navigate("/appointments")
  }

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record)
    setIsDialogOpen(true)
  }

  // Convert API appointments to the format used in the UI
  const formatAppointments = () => {
    if (!appointments) return [];
    
    return appointments
      .filter(app => app.status !== 'completed' && app.status !== 'cancelled')
      .map(app => ({
        doctor: app.doctor?.name || `Dr. (ID: ${app.doctor_id})`,
        time: app.time,
        date: new Date(app.date).toLocaleDateString(),
        type: "Consultation",
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        duration: "30 mins", // Default duration
        symptoms: [app.reason]
      }))
      .slice(0, 3); // Just show the first 3
  };
  
  // Convert API analyses to the format used in the UI
  const formatHealthRecords = () => {
    if (!analyses) return [];
    
    return analyses.map(analysis => ({
      title: analysis.message || `${analysis.analysis_type} Analysis`,
      date: new Date(analysis.created_at).toISOString().split('T')[0],
      status: "Completed",
      type: analysis.analysis_type === 'file' ? 'File Analysis' : 'Audio Analysis',
      doctor: "System Analysis" // Default doctor name
    }))
    .slice(0, 3); // Just show the first 3
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[200px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.full_name || 'Patient'}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your health today</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/payments/history')}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Payment History
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/appointments/manage')}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Manage Appointments
            </Button>
            <Button onClick={handleScheduleAppointment}>
              <Plus className="h-5 w-5 mr-2" />
              Schedule New Appointment
            </Button>
          </div>
        </div>

        {/* Patient Info Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {user.email || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {user.phone || 'Not specified'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Display error message if data fetch failed */}
        {dataError && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{dataError}</p>
                </div>
                <div className="mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show loading state for dashboard stats if needed */}
        {loadingData ? (
          <>
            {/* Stats Loading */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[100px]" />
              ))}
            </div>
            
            {/* Health Metrics & Appointments Loading */}
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
            
            {/* Health Records & Activities Loading */}
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[300px]" />
            </div>
          </>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Appointments
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.upcomingAppointments}</div>
                  <p className="text-xs text-green-600">
                    Recently scheduled
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Consultations
                  </CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.completedConsultations}</div>
                  <p className="text-xs text-green-600">
                    Past consultations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Health Records
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.healthRecords}</div>
                  <p className="text-xs text-green-600">
                    Available records
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Messages
                  </CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.messages}</div>
                  <p className="text-xs text-green-600">
                    Unread messages
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Analysis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Respiratory Analysis Summary</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate('/analysis')}
                    >
                      <Wind className="h-4 w-4 mr-2" />
                      New Analysis
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyses.length > 0 ? (
                    <div className="space-y-4">
                      {/* Overview Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg bg-blue-50">
                          <p className="text-sm text-gray-600">Total Analyses</p>
                          <p className="text-2xl font-bold text-blue-600">{analyses.length}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50">
                          <p className="text-sm text-gray-600">Latest Result</p>
                          <p className="text-lg font-bold text-green-600 truncate">
                            {analyses[0]?.message || 'Completed'}
                          </p>
                        </div>
                      </div>

                      {/* Recent Analyses List */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-500">Recent Results</h4>
                        {analyses.slice(0, 4).map((analysis, index) => (
                          <div
                            key={analysis.id || index}
                            className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-full bg-indigo-50">
                                <Stethoscope className="h-4 w-4 text-indigo-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{analysis.message || 'Respiratory Analysis'}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(analysis.created_at).toLocaleDateString()} &middot; {analysis.analysis_type === 'file' ? 'File Upload' : 'Audio Recording'}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              analysis.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {analysis.status || 'Completed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wind className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-1">No analyses yet</p>
                      <p className="text-sm text-gray-400 mb-4">Upload an audio sample to get your first respiratory analysis</p>
                      <Button onClick={() => navigate('/analysis')}>
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Start Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Upcoming Appointments</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => navigate('/appointments/manage')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View All & Manage
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formatAppointments().length > 0 ? (
                      formatAppointments().map((appointment, index) => (
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
                            <p className="font-medium">{appointment.date}</p>
                            <p className="text-sm">{appointment.time}</p>
                            <p className="text-sm text-gray-500">{appointment.duration}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appointment.status.toLowerCase() === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No upcoming appointments</p>
                        <Button className="mt-4" onClick={handleScheduleAppointment}>
                          Schedule Now
                        </Button>
                      </div>
                    )}
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
                    {formatHealthRecords().length > 0 ? (
                      formatHealthRecords().map((record, index) => (
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
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No health records available</p>
                      </div>
                    )}
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
                    {appointments.length > 0 ? (
                      // Use the most recent appointments as activities
                      appointments
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 3)
                        .map((appointment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div>
                              <h3 className="font-medium">
                                {appointment.status === 'completed' 
                                  ? 'Appointment Completed' 
                                  : appointment.status === 'confirmed'
                                    ? 'Appointment Confirmed'
                                    : 'Appointment Booked'}
                              </h3>
                              <p className="text-sm text-gray-500">Doctor ID: {appointment.doctor_id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(appointment.created_at).toLocaleDateString()} at {appointment.time}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No recent activities</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <section className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-5 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 mb-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">Appointments</h3>
              <p className="text-sm text-gray-500 mb-4">Manage your upcoming appointments</p>
              <Link
                to="/patient/appointments"
                className="text-blue-500 text-sm font-medium hover:underline"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-5 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 mb-4 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <Clipboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">Health Records</h3>
              <p className="text-sm text-gray-500 mb-4">Access your medical history</p>
              <Link
                to="/patient/health-records"
                className="text-green-500 text-sm font-medium hover:underline"
              >
                View Records
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        </div>
      </div>
    </DashboardLayout>
  )
} 