import { Button } from "../ui/button"
import { MobileMenu } from "../ui/mobile-menu"
import { Link } from "react-router-dom"
export function Navigation() {
  return (
    <nav className="container mx-auto px-4 py-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-50 border-b border-gray-100">
      <div className="flex items-center">
        <span  className="text-2xl font-bold ml-2 text-[#1a2352] font-display bg-gradient-to-r from-[#1a2352] to-[#ff7757] bg-clip-text text-transparent cursor-pointer"><Link to={"/"}>NeumoAI</Link></span>
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <a href="#" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Home
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <a href="#features" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Features
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <a href="#testimonials" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Testimonials
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <a href="#how-it-works" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          How it works
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <a href="#contact" className="text-[#1a2352] hover:text-[#ff7757] transition-colors relative group">
          Contact
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff7757] group-hover:w-full transition-all duration-300"></span>
        </a>
        <Button asChild className="bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90 shadow-lg hover:shadow-xl transition-all text-white">
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
      <MobileMenu />
    </nav>
  )
} 