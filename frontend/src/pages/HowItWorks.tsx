import { motion } from "framer-motion"
import { assets } from "../config/assets"
import { Mic, Brain, FileText, Stethoscope } from "lucide-react"
import { Link } from "react-router-dom"
const steps = [
  {
    icon: Mic,
    title: "Record Your Breathing",
    description: "Record your breathing sounds for 30 seconds using your device's microphone. Ensure you're in a quiet environment for best results.",
    image: assets.howItWorks.image1
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our advanced AI algorithms analyze your breathing patterns, detecting any anomalies or potential respiratory issues.",
    image: assets.howItWorks.image2
  },
  {
    icon: FileText,
    title: "Detailed Report",
    description: "Receive a comprehensive report with visualizations and insights about your respiratory health.",
    image: assets.howItWorks.image3
  },
  {
    icon: Stethoscope,
    title: "Professional Review",
    description: "Share your results with healthcare professionals for expert interpretation and recommendations.",
    image: assets.howItWorks.image4
  }
]

export default function HowItWorks() {
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
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 max-w-md mx-auto w-full"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg">
                  <step.icon className="w-6 h-6 text-[#ff7757]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
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
          <button className="px-6 py-3 bg-[#1a2352] text-white rounded-lg hover:bg-[#ff7757] transition-colors">
            <Link to="/analysis">Get Started</Link>
          </button>
        </motion.div>
      </div>
    </div>
  )
}