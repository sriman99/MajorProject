import { motion } from "framer-motion"
import { assets } from "../config/assets"
import { Mic, Brain, FileText, Stethoscope, Info } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { StepModal } from "../components/StepModal"
import { StepOneDetails, StepTwoDetails, StepThreeDetails, StepFourDetails } from "../components/StepDetails"
import { Button } from "@/components/ui/button"

const steps = [
  {
    icon: Mic,
    title: "Record Your Breathing",
    description: "Record your breathing sounds for 30 seconds using your device's microphone. Ensure you're in a quiet environment for best results.",
    image: assets.howItWorks.image1,
    details: <StepOneDetails />
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our advanced AI algorithms analyze your breathing patterns, detecting any anomalies or potential respiratory issues.",
    image: assets.howItWorks.image2,
    details: <StepTwoDetails />
  },
  {
    icon: FileText,
    title: "Detailed Report",
    description: "Receive a comprehensive report with visualizations and insights about your respiratory health.",
    image: assets.howItWorks.image3,
    details: <StepThreeDetails />
  },
  {
    icon: Stethoscope,
    title: "Professional Review",
    description: "Share your results with healthcare professionals for expert interpretation and recommendations.",
    image: assets.howItWorks.image4,
    details: <StepFourDetails />
  }
]

export default function HowItWorks() {
  const [openModalIndex, setOpenModalIndex] = useState<number | null>(null);
  
  const openModal = (index: number) => {
    setOpenModalIndex(index);
  };
  
  const closeModal = () => {
    setOpenModalIndex(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#1a2352] to-[#ff7757] bg-clip-text text-transparent">
              How It Works
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our four-step process makes respiratory analysis simple, accurate, and accessible
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 max-w-md mx-auto w-full group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg">
                  <step.icon className="w-6 h-6 text-[#ff7757]" />
                </div>
                <div className="absolute top-4 right-4">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => openModal(index)}
                  >
                    <Info className="w-4 h-4 mr-1" /> Learn More
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {/* View Details Button */}
                <div className="mt-4">
                  <Button 
                    variant="ghost" 
                    className="text-[#1a2352] hover:text-[#ff7757] p-0 font-medium"
                    onClick={() => openModal(index)}
                  >
                    View Detailed Explanation
                  </Button>
                </div>
              </div>
              
              {/* Modal for each step */}
              <StepModal
                isOpen={openModalIndex === index}
                onClose={closeModal}
                title={step.title}
                description={step.description}
                image={step.image}
                Icon={step.icon}
                details={step.details}
                index={index}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button className="px-6 py-3 bg-[#1a2352] text-white rounded-lg hover:bg-[#ff7757] transition-colors">
            <Link to="/analysis">Get Started</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}