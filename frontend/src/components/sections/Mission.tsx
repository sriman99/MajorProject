import { Button } from "../ui/button"
import { Link } from "react-router-dom"
export function Mission() {
  return (
    <section className="py-32 relative pl-10 pr-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-[#ff7757]/5 via-transparent to-[#1a2352]/5 rounded-3xl blur-3xl -z-10" />
      <img 
        src="/67f907e9bd92c5e1c7e6bf06_12.svg" 
        alt="" 
        className="absolute top-1/4 left-10 w-16 h-16 animate-float opacity-40"
      />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 order-2 md:order-1">
            <div className="inline-block">
              <span className="text-[#ff7757] bg-[#ff7757]/10 px-4 py-2 rounded-full text-md font-medium">
                Mission
              </span>
            </div>
            <h2 className="text-5xl font-bold text-[#1a2352] leading-tight">
              At NeumoAI, We Breathe Innovation Into Healthcare.
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our mission is to harness the power of artificial intelligence to revolutionize respiratory diagnostics. By turning breath into data, and data into diagnosis, we empower people to detect diseases early, consult seamlessly with doctors, and take control of their well-being — anytime, anywhere.
            </p>
            <p className="text-xl text-gray-600">
              We strive to make healthcare more{" "}
              <span className="font-semibold text-[#1a2352]">accessible</span>,{" "}
              <span className="font-semibold text-[#1a2352]">intelligent</span>, and deeply{" "}
              <span className="font-semibold text-[#1a2352]">human</span>.
            </p>
            <div className="flex space-x-4">
              
              <Link to="/how-it-works">
                <Button variant="outline" className="border-[#ff7757] text-[#ff7757] hover:bg-[#ff7757]/10">
                  Learn More
                </Button>
              </Link>
              
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="relative max-w-md mx-auto">
              <div className="absolute -z-10 w-full h-full bg-[#ff7757]/10 rounded-full filter blur-[100px]" />
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1780&q=80"
                alt="Meditation Practice"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500 w-full"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-4 rounded-2xl shadow-xl">
                <img src="/67f907e9bd92c5e1c7e6bf07_3.svg" alt="" className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 