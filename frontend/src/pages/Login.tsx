import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { assets } from "../config/assets"
import { motion } from "framer-motion"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Handle form submission
      console.log("Form submitted:", formData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img 
          src={assets.decorative.blob1} 
          alt="" 
          className="absolute top-0 right-0 w-96 h-96 opacity-10"
          animate={{
            y: [0, 20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.img 
          src={assets.decorative.blob2} 
          alt="" 
          className="absolute bottom-0 left-0 w-96 h-96 opacity-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.img 
              src={assets.logo} 
              alt="NeumoAI Logo" 
              className="w-16 h-16 mx-auto mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <h1 className="text-3xl font-bold text-[#1a2352] mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue your health journey</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <motion.p 
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <motion.p 
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#ff7757] focus:ring-[#ff7757] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-[#ff7757] hover:text-[#1a2352] transition-colors">
                Forgot password?
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 17,
                opacity: { duration: 0.5, delay: 0.6 }
              }}
            >
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#1a2352] to-[#ff7757] hover:from-[#ff7757] hover:to-[#1a2352] text-white py-6 text-lg transition-all duration-300"
              >
                Sign In
              </Button>
            </motion.div>

            <motion.p 
              className="text-center text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Don't have an account?{" "}
              <a href="/signup" className="text-[#ff7757] hover:text-[#1a2352] transition-colors">
                Sign up
              </a>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  )
} 