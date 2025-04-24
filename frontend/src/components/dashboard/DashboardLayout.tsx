import { ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { LogOut, User, Settings, Home, Calendar } from "lucide-react"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuthWithFetch()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img src="/logo.png" alt="NeumoAI Logo" className="h-10" />
            </Link>
            <span className="ml-4 font-semibold text-gray-700">Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.full_name || 'User'}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/appointments/manage')}>
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
} 