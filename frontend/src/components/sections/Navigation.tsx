import { Button } from "../ui/button"
import { MobileMenu } from "../ui/mobile-menu"
import { Link, useNavigate } from "react-router-dom"
import { UserCircle, LogOut, Stethoscope, Calendar, MessageCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-hot-toast"
import { useUserRole } from "@/hooks/useUserRole"

export function Navigation() {
  const navigate = useNavigate()
  const { isLoggedIn, logout, user } = useAuth()
  const { data: userRoleData } = useUserRole()
  
  // Determine user role
  const isDoctor = userRoleData?.role === 'doctor' || 
                  (user && user.doctor_profile ? true : false);
  const isPatient = userRoleData?.role === 'patient' || 
                   (user && !user.doctor_profile && !user.admin_profile ? true : false);

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  const handleProfile = () => {
    if (!user) return

    if (isDoctor) {
      navigate('/doctor/dashboard')
    } else if (userRoleData?.role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/patient/dashboard')
    }
  }
  
  // Navigation links based on user role
  const getNavLinks = () => {
    if (isDoctor) {
      return (
        <>
          <Link to="/" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/doctor/dashboard" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/appointments/manage" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Appointments
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/contact" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link to="/" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/features" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/how-it-works" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            How it works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/contact" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
          </Link>
        </>
      );
    }
  };

  return (
    <nav className="container mx-auto px-5 py-2 flex items-center justify-between border-b border-gray-100/50">
      <div className="flex items-center">
        {/* <span  className="text-2xl font-bold ml-2 text-[#1a2352] font-display bg-gradient-to-r from-[#1a2352] to-[#ff7757] bg-clip-text text-transparent cursor-pointer"><Link to={"/"}>NeumoAI</Link></span>
         */}
         <Link to={"/"}>
         <img src="/logo.png" alt="NeumoAI Logo" className="w-25 h-15" />
         </Link>
      </div>
      <div className="hidden md:flex items-center space-x-8">
        {getNavLinks()}
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                className="text-[#1a2352] hover:text-[#ff7757] transition-colors"
                onClick={handleProfile}
              >
                {isDoctor ? <Stethoscope className="w-5 h-5 mr-2" /> : <UserCircle className="w-5 h-5 mr-2" />}
                {isDoctor ? "Doctor Profile" : "Profile"}
              </Button>
              <Button
                variant="outline"
                className="border-[#ff7757] text-[#ff7757] hover:bg-[#ff7757]/10"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="border-[#ff7757] text-[#ff7757] hover:bg-[#ff7757]/10">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90 shadow-lg hover:shadow-xl transition-all text-white">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <MobileMenu isDoctor={isDoctor} />
    </nav>
  )
}