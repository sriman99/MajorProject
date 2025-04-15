import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      
      <Router>
        <div className="min-h-screen bg-background">
        <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/features" element={<Features />} />
            <Route path="/analysis" element={<RespiratoryAnalysis />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/testimonials" element={<Testimonials />} />
          </Routes>
          <Footer />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
