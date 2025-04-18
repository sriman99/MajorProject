import { Link } from "react-router-dom"
import { assets } from "../../config/assets"
import { Button } from "../ui/button"

export function About() {
  return (
    <section id="about" className="py-32 pl-10 pr-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7757]/5 via-transparent to-[#1a2352]/5 rounded-3xl blur-3xl -z-10" />
      <img 
        src="/67f907e9bd92c5e1c7e6bf03_100.svg" 
        alt="" 
        className="absolute top-20 right-20 w-16 h-16 animate-float opacity-40"
      />
      <img 
        src={assets.social.facebook}
        alt="" 
        className="absolute bottom-20 left-20 w-24 h-24 animate-float opacity-30"
      />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="grid grid-cols-2 gap-4 relative">
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src={assets.social.facebook} 
                alt="Meditation session" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 mt-16">
              <img 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="Breathing exercise" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                alt="Health monitoring" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -z-10 w-full h-full bg-[#ff7757]/10 rounded-full filter blur-[100px]" />
          </div>
          <div className="space-y-8">
            <div className="inline-block">
              <span className="text-[#ff7757] bg-[#ff7757]/10 px-4 py-2 rounded-full text-md font-medium">
                About Us
              </span>
            </div>
            <h2 className="text-5xl font-bold text-[#1a2352] leading-tight">
              What Is NeumoAI?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              AI-powered web platform that helps users detect respiratory diseases through breathing sound analysis, while providing video consultations with doctors and health monitoring features.
            </p>
            <div className="flex space-x-4">
              <Link to="/signup">
                <Button className="text-white bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
                  Sign up
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" className="border-[#ff7757] text-[#ff7757] hover:bg-[#ff7757]/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 