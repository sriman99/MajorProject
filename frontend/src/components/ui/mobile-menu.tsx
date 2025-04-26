import { Sheet, SheetContent, SheetTrigger } from "./sheet"
import { Button } from "./button"
import { Menu } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { UserCircle, LogOut, Stethoscope } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-hot-toast"

export function MobileMenu({ isDoctor = false }) {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <Link to="/" className="block px-2 py-1 text-lg">
            Home
          </Link>
          
          {isDoctor ? (
            <>
              <Link to="/doctor/dashboard" className="block px-2 py-1 text-lg">
                Dashboard
              </Link>
              <Link to="/appointments/manage" className="block px-2 py-1 text-lg">
                Appointments
              </Link>
            </>
          ) : (
            <>
              <Link to="/features" className="block px-2 py-1 text-lg">
                Features
              </Link>
              <Link to="/how-it-works" className="block px-2 py-1 text-lg">
                How it works
              </Link>
            </>
          )}
          
          <Link to="/contact" className="block px-2 py-1 text-lg">
            Contact
          </Link>
          
          {isLoggedIn ? (
            <div className="flex flex-col gap-4 mt-4">
              <Button
                variant="ghost"
                className="text-[#1a2352] hover:text-[#ff7757] transition-colors justify-start"
                asChild
              >
                <Link to={isDoctor ? "/doctor/dashboard" : "/profile"}>
                  {isDoctor ? <Stethoscope className="w-5 h-5 mr-2" /> : <UserCircle className="w-5 h-5 mr-2" />}
                  {isDoctor ? "Doctor Profile" : "Profile"}
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-[#ff7757] text-[#ff7757] hover:bg-[#ff7757]/10 justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              <Button asChild variant="outline" className="border-[#ff7757] text-[#ff7757] hover:bg-[#ff7757]/10">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
} 