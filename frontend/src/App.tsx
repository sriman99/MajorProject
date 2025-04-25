import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster as HotToaster } from 'react-hot-toast'
import { ToastProvider, Toaster } from './components/ui/use-toast'
import { Home } from './pages/Home'
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

import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

// Layout component that conditionally renders Navigation and Footer
function AppLayout() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard') || 
                           location.pathname.includes('/appointments/manage');
  
  return (
    <div className="min-h-screen bg-background">
      {!isDashboardRoute && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/features" element={<Features />} />
        <Route path="/analysis" element={<RespiratoryAnalysis />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/manage" element={<AppointmentManagement />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isDashboardRoute && <Footer />}
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <HotToaster position="top-right" />
        <Toaster />
        <Router>
          <AppLayout />
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
