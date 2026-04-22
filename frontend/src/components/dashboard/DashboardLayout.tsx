import { ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuthWithFetch } from "@/hooks/useAuth"
import { LogOut, Settings, Home, Calendar, Menu } from "lucide-react"
import { NotificationCenter } from "../NotificationCenter"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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

  const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Appointments", icon: Calendar, path: "/appointments/manage" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img src="/logo.png" alt="NeumoAI Logo" className="h-8 md:h-10" />
            </Link>
            <span className="ml-3 font-semibold text-gray-700 hidden sm:inline">Dashboard</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.full_name || 'User'}</span>
            </div>
            <NotificationCenter />
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.label} size="sm" variant="ghost" onClick={() => navigate(item.path)}>
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              )
            })}
            <Button size="sm" variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center space-x-2">
            <NotificationCenter />
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col gap-2 mt-6">
                  <p className="text-sm text-gray-500 mb-2">
                    Signed in as <span className="font-medium text-gray-900">{user?.full_name || 'User'}</span>
                  </p>
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button key={item.label} variant="ghost" className="justify-start" onClick={() => navigate(item.path)}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    )
                  })}
                  <div className="border-t pt-2 mt-2">
                    <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
} 