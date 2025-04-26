import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Toaster as HotToaster } from 'react-hot-toast'
import { ToastProvider, Toaster } from './components/ui/use-toast'
import { Home } from './pages/Home'
import { DoctorHome } from './pages/DoctorHome'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Features from './pages/Features'
import RespiratoryAnalysis from './pages/RespiratoryAnalysis'
import Appointments from './pages/Appointments'
import Hospitals from './pages/Hospitals'
import { Navigation } from './components/sections/Navigation'
import { Footer } from './components/sections/Footer'
import HowItWorks from './pages/HowItWorks'
import { Testimonials } from './components/sections/Testimonials'
import PatientDashboard from './pages/patient/Dashboard'
import DoctorDashboard from './pages/doctor/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import AppointmentManagement from './pages/AppointmentManagement'
import Contact from './pages/Contact'
import { ChatBot } from './components/chat/ChatBot'
import { DoctorChat } from './components/chat/DoctorChat'
import { useUserRole, getUserRole } from './hooks/useUserRole'
import { useAuth } from './hooks/useAuth'
import NotFound from './pages/NotFound'
import type { ReactNode } from 'react'

// A component to conditionally render Home or DoctorHome based on user role
const HomePage = () => {
  const { user } = useAuth();
  const { data: userRoleData } = useUserRole();
  const isDoctor = userRoleData?.role === 'doctor' || 
                  (user && user.doctor_profile ? true : false);
  
  return isDoctor ? <DoctorHome /> : <Home />;
};

// Protected route component to handle role-based access
const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode, requiredRole: 'patient' | 'doctor' | 'admin' | null }) => {
  const { user, isLoggedIn } = useAuth()
  const { data: userRoleData, isLoading } = useUserRole()
  
  // Fallback to direct role calculation if the query hasn't loaded yet
  const calculatedRole = userRoleData?.role || getUserRole(user)
  
  // If loading and we have a token, show loading indicator
  if (isLoading && !calculatedRole && isLoggedIn) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  // If a specific role is required but user doesn't have it
  if (requiredRole && calculatedRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    if (calculatedRole === 'patient') {
      return <Navigate to="/patient/dashboard" replace />
    } else if (calculatedRole === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />
    } else if (calculatedRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    
    // If we can't determine role yet but user is logged in
    if (isLoggedIn) {
      return <div className="flex items-center justify-center h-screen">Verifying access...</div>
    }
    
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Dashboard redirect based on user role
const DashboardRedirect = () => {
  const { user, isLoggedIn } = useAuth()
  const { data: userRoleData, isLoading } = useUserRole()
  
  // Fallback to direct role calculation if the query hasn't loaded yet
  const calculatedRole = userRoleData?.role || getUserRole(user)
  
  if (isLoading && !calculatedRole && isLoggedIn) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>
  }
  
  if (calculatedRole === 'patient') {
    return <Navigate to="/patient/dashboard" replace />
  } else if (calculatedRole === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />
  } else if (calculatedRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  
  return <Navigate to="/login" replace />
}

// Function to determine if current page should be hidden from doctors
const isDoctorRestrictedRoute = (pathname: string): boolean => {
  const restrictedRoutes = [
    '/analysis',
    '/appointments', // For booking appointments (not managing)
    '/hospitals',
    '/features'
  ];
  
  // Check if the current pathname matches any restricted route
  return restrictedRoutes.some(route => pathname === route || 
    // Allow /appointments/manage for doctors (but block other /appointments/ routes)
    (pathname.startsWith(`${route}/`) && !pathname.includes('/appointments/manage')));
};

// Layout component that conditionally renders Navigation and Footer
function AppLayout() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard') || 
                           location.pathname.includes('/appointments/manage');
  const { user, isLoggedIn } = useAuth();
  const { data: userRoleData } = useUserRole();
  
  // Calculate if user is a doctor, either from query or direct calculation
  const isDoctor = userRoleData?.role === 'doctor' || 
                  (user && user.doctor_profile ? true : false);
                  
  // Redirect doctors from restricted patient-only routes
  if (isDoctor && isDoctorRestrictedRoute(location.pathname)) {
    return <Navigate to="/" replace />;
  }
                  
  // Show ChatBot on public pages (non-dashboard) for everyone except doctors
  // Show DoctorChat only for doctors regardless of page
  const shouldShowChatBot = !isDashboardRoute && !isDoctor;
  const shouldShowDoctorChat = isDoctor;
  
  return (
    <div className="min-h-screen bg-background">
      {!isDashboardRoute && <Navigation />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/features" element={<Features />} />
        <Route path="/analysis" element={<RespiratoryAnalysis />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/manage" element={
          <ProtectedRoute requiredRole={null}>
            <AppointmentManagement />
          </ProtectedRoute>
        } />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/testimonials" element={<Testimonials />} />
        
        {/* Role-specific routes */}
        <Route path="/patient/dashboard" element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Dashboard redirect */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboardRoute && <Footer />}
      
      {/* Display only one chat component at a time - this prevents overlapping */}
      {shouldShowDoctorChat ? <DoctorChat /> : shouldShowChatBot ? <ChatBot /> : null}
    </div>
  );
}

function App() {
  const { user, isLoggedIn, fetchUser } = useAuth();
  
  // Re-fetch user data if token exists but no user data is loaded
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !user) {
      fetchUser();
    }
  }, [user, fetchUser]);
  
  return (
    <ToastProvider>
      <HotToaster position="top-right" />
      <Toaster />
      <Router>
        <AppLayout />
      </Router>
    </ToastProvider>
  )
}

export default App
