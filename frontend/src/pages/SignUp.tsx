import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { assets } from "../config/assets"
import { motion, AnimatePresence } from "framer-motion"
import apiClient from "@/services/api"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../hooks/useAuth"
import { Stethoscope, User, ArrowLeft, Check } from "lucide-react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"

type Role = "" | "doctor" | "user"

export default function SignUp() {
  const navigate = useNavigate()
  const login = useAuth((state) => state.login)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role>("")

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/\d/.test(password)) return "Password must contain at least one digit"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) return "Password must contain at least one special character"
    return null
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name) newErrors.full_name = "Full name is required"
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid"
    }
    if (!formData.phone) newErrors.phone = "Phone number is required"
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else {
      const passwordError = validatePassword(formData.password)
      if (passwordError) newErrors.password = passwordError
    }
    if (!formData.confirm_password) newErrors.confirm_password = "Please confirm your password"

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setLoading(true)
      try {
        await apiClient.post("/signup", { ...formData, role: selectedRole })

        const loginResponse = await apiClient.post<{ access_token: string }>("/token",
          new URLSearchParams({
            username: formData.email,
            password: formData.password,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )

        await login(loginResponse.data.access_token)

        toast.success("Account created successfully!")

        if (selectedRole === "doctor") {
          navigate("/doctor/dashboard")
        } else {
          navigate("/patient/dashboard")
        }

      } catch (error: any) {
        console.error(error)
        if (error.response?.status === 422) {
          const serverErrors = error.response.data.errors || {}
          setErrors(serverErrors)
          toast.error("Please check your input and try again")
        } else if (error.response?.status === 409) {
          toast.error("Email or phone number already exists")
        } else {
          toast.error("An error occurred. Please try again later")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleGoogleSignup = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return
    setLoading(true)
    try {
      const response = await apiClient.post<{ access_token: string }>("/auth/google", {
        credential: credentialResponse.credential,
        role: selectedRole,
      })
      await login(response.data.access_token)
      toast.success("Account created successfully!")
      navigate(selectedRole === "doctor" ? "/doctor/dashboard" : "/patient/dashboard")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Google signup failed")
    } finally {
      setLoading(false)
    }
  }

  const roleCards = [
    {
      role: "user" as Role,
      title: "Patient",
      description: "Book appointments, get AI-powered respiratory analysis, and manage your health records",
      icon: User,
      color: "from-blue-500 to-cyan-400",
      borderColor: "border-blue-400",
      bgHover: "hover:border-blue-400 hover:shadow-blue-100",
      features: ["AI Respiratory Analysis", "Book Appointments", "Chat with Doctors"],
    },
    {
      role: "doctor" as Role,
      title: "Doctor",
      description: "Manage your practice, view patient records, and provide consultations online",
      icon: Stethoscope,
      color: "from-[#1a2352] to-[#ff7757]",
      borderColor: "border-[#ff7757]",
      bgHover: "hover:border-[#ff7757] hover:shadow-orange-100",
      features: ["Manage Appointments", "View Patient Records", "Online Consultations"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src={assets.decorative.blob1}
          alt=""
          className="absolute top-0 right-0 w-96 h-96 opacity-10"
          animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={assets.decorative.blob2}
          alt=""
          className="absolute bottom-0 left-0 w-96 h-96 opacity-10"
          animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <AnimatePresence mode="wait">
          {/* Step 1: Role Selection */}
          {!selectedRole && (
            <motion.div
              key="role-selection"
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <motion.img
                  src={assets.logo}
                  alt="NeumoAI Logo"
                  className="w-30 h-17 mx-auto mb-4"
                  whileHover={{ scale: 1.05 }}
                />
                <h1 className="text-3xl font-bold text-[#1a2352] mb-2">Join NeumoAI</h1>
                <p className="text-gray-600 text-lg">How would you like to use NeumoAI?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {roleCards.map((card) => (
                  <motion.button
                    key={card.role}
                    onClick={() => setSelectedRole(card.role)}
                    className={`relative bg-white rounded-2xl shadow-md border-2 border-transparent p-8 text-left transition-all duration-300 cursor-pointer ${card.bgHover} hover:shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5`}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1a2352] mb-2">
                      I'm a {card.title}
                    </h2>
                    <p className="text-gray-500 mb-5 text-sm leading-relaxed">{card.description}</p>
                    <ul className="space-y-2">
                      {card.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                ))}
              </div>

              <motion.p
                className="text-center text-gray-600 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Already have an account?{" "}
                <Link to="/login" className="text-[#ff7757] hover:text-[#1a2352] transition-colors font-medium">
                  Sign in
                </Link>
              </motion.p>
            </motion.div>
          )}

          {/* Step 2: Signup Form */}
          {selectedRole && (
            <motion.div
              key="signup-form"
              className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <button
                  onClick={() => { setSelectedRole(""); setErrors({}) }}
                  className="flex items-center text-gray-500 hover:text-[#1a2352] transition-colors text-sm cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Change role
                </button>
              </div>

              <div className="text-center mb-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedRole === "doctor" ? "from-[#1a2352] to-[#ff7757]" : "from-blue-500 to-cyan-400"} flex items-center justify-center mx-auto mb-4`}>
                  {selectedRole === "doctor"
                    ? <Stethoscope className="w-7 h-7 text-white" />
                    : <User className="w-7 h-7 text-white" />
                  }
                </div>
                <h1 className="text-2xl font-bold text-[#1a2352] mb-1">
                  Sign up as {selectedRole === "doctor" ? "Doctor" : "Patient"}
                </h1>
                <p className="text-gray-500 text-sm">Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder={selectedRole === "doctor" ? "Dr. John Smith" : "John Smith"}
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={errors.full_name ? "border-red-500" : ""}
                  />
                  {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}
                </motion.div>

                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </motion.div>

                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </motion.div>

                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <Label htmlFor="password">Password</Label>
                  <p className="text-xs text-gray-500">
                    Must be 8+ chars with uppercase, lowercase, number & special character
                  </p>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </motion.div>

                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className={errors.confirm_password ? "border-red-500" : ""}
                  />
                  {errors.confirm_password && <p className="text-red-500 text-xs">{errors.confirm_password}</p>}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17, opacity: { duration: 0.4, delay: 0.35 } }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#1a2352] to-[#ff7757] hover:from-[#ff7757] hover:to-[#1a2352] text-white py-6 text-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.38 }}
                >
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </motion.div>

                {/* Google Sign-Up */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSignup}
                    onError={() => toast.error("Google signup failed")}
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="rectangular"
                    theme="outline"
                  />
                </motion.div>

                <motion.p
                  className="text-center text-gray-600 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#ff7757] hover:text-[#1a2352] transition-colors font-medium">
                    Sign in
                  </Link>
                </motion.p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
