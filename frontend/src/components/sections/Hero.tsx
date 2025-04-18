import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import { ChatBot } from "../chat/ChatBot"

export function Hero() {
  return (
    <section className="container mx-auto pl-10 px-4 py-20 flex flex-col md:flex-row items-center relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff7757]/5 via-transparent to-[#1a2352]/5 rounded-3xl blur-3xl -z-10" />
      <img 
        src="/67f907e9bd92c5e1c7e6bf09_69.svg" 
        alt="" 
        className="absolute -top-10 right-10 w-20 h-20 animate-float opacity-50"
      />
      <div className="md:w-1/2 space-y-8 relative">
        <h1 className="text-7xl font-bold leading-tight animate-fade-in">
          <span className="bg-gradient-to-r from-[#1a2352] to-[#ff7757] bg-clip-text text-transparent">AI-Powered</span><br />
          <span className="text-[#ff7757]">Respiratory</span> Health<br />
          Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-lg animate-fade-in-delay leading-relaxed">
          Detect respiratory issues through sound, consult doctors online, and track your health with our cutting-edge AI technology.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
        <div className="w-full flex flex-col sm:flex-row gap-3 rounded-4xl transition-all duration-300">
          <Link to="/analysis" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-[#ff7757] to-[#ff5757] text-white text-lg px-8 py-6 rounded-4xl hover:from-[#ff5757] hover:to-[#ff7757] hover:scale-102 hover:shadow-xl transition-all duration-300">
              Start Analysis
            </Button>
          </Link>
          <Link to="/appointments" className="flex-1">
            <Button variant="outline" className="w-full text-[#1a2352] border-2 border-[#ff7757] text-lg px-8 py-6 rounded-4xl hover:bg-[#ff7757]/10 hover:text-[#ff7757] hover:scale-102 transition-all duration-300">
              Book Appointment
            </Button>
          </Link>
          <Link to="/hospitals" className="flex-1">
            <Button variant="outline" className="w-full text-[#1a2352] border-2 border-[#ff7757] text-lg px-8 py-6 rounded-4xl hover:bg-[#ff7757]/10 hover:text-[#ff7757] hover:scale-102 transition-all duration-300">
              Find Hospital
            </Button>
          </Link>
        </div>
      </div>

      </div>
      <div className="md:w-1/2 mt-10 md:mt-0 relative animate-float">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-[#ff7757]/20 to-[#1a2352]/20 rounded-full filter blur-3xl -z-10 transform -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-md mx-auto transform hover:scale-105 transition-transform duration-700 hover:rotate-2">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Doctor using stethoscope for respiratory checkup" 
            className="w-full rounded-2xl shadow-2xl"
          />
        </div>
      </div>
      <ChatBot />
    </section>
  )
} 