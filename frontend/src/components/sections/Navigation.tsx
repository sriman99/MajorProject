import { Button } from "../ui/button"
import { MobileMenu } from "../ui/mobile-menu"
import { Link, useNavigate } from "react-router-dom"
import { UserCircle, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-hot-toast"

export function Navigation() {
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out successfully')
  }

  return (
    <nav className="container mx-auto px-4 py-6 flex items-center justify-between sticky top-0 bg-white  z-50 border-b border-gray-100/50">
      <div className="flex items-center">
        <span className="text-2xl font-bold ml-2 text-[#1a2352] font-display bg-gradient-to-r from-[#1a2352] to-[#ff7757] bg-clip-text text-transparent cursor-pointer">
          <Link to={"/"}>NeumoAI</Link>
        </span>
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <Link to="/" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Home
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </Link>
        <Link to="/features" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Features
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </Link>
        <a href="/testimonials" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Testimonials
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <a href="/how-it-works" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          How it works
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <a href="/contact" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Contact
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                className="text-[#1a2352] hover:text-[#ff7757] transition-colors"
                asChild
              >
                <Link to="/profile">
                  <UserCircle className="w-5 h-5 mr-2" />
                  Profile
                </Link>
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
      <MobileMenu />
    </nav>
  )
} 