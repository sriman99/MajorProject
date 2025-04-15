import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const features = [
  {
    title: "AI-Powered Respiratory Analysis",
    description: "Advanced AI algorithms analyze breathing patterns and sounds to detect potential respiratory issues with high accuracy.",
    icon: "🔍"
  },
  {
    title: "Real-time Monitoring",
    description: "Continuous monitoring of respiratory health with instant feedback and alerts for any concerning patterns.",
    icon: "📊"
  },
  {
    title: "Doctor Consultation",
    description: "Seamless video consultations with licensed doctors for professional diagnosis and treatment recommendations.",
    icon: "👨‍⚕️"
  },
  {
    title: "Health Dashboard",
    description: "Comprehensive dashboard showing your respiratory health metrics, trends, and recommendations.",
    icon: "📱"
  },
  {
    title: "Secure Data Storage",
    description: "End-to-end encrypted storage of your health data with strict privacy controls and HIPAA compliance.",
    icon: "🔒"
  },
  {
    title: "Mobile Accessibility",
    description: "Access your respiratory health data and connect with doctors anytime, anywhere through our mobile app.",
    icon: "📲"
  }
]

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section with CTA */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff7757]/5 via-transparent to-[#1a2352]/5 rounded-3xl blur-3xl -z-10" />
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-[#1a2352] mb-4">
              Powerful Features for Your Respiratory Health
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Discover how NeumoAI's advanced features can help you monitor and improve your respiratory health with cutting-edge technology.
            </p>
            <Button 
              className="bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90 shadow-lg hover:shadow-xl transition-all text-white text-lg px-8 py-6 rounded-xl mb-12"
              asChild
            >
              <Link to="/analysis">Get Started Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-[#1a2352] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 