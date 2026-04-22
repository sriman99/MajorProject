import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { assets } from "../config/assets"
import { motion, AnimatePresence } from "framer-motion"
import apiClient from "@/services/api"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "../hooks/useAuth"
import { Stethoscope, User, ArrowLeft, Check, CheckCircle2 } from "lucide-react"
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
  const [shake, setShake] = useState(false)

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const isFieldValid = (field: string) => {
    const v = formData[field as keyof typeof formData]
    if (!v) return false
    if (field === "email") return /\S+@\S+\.\S+/.test(v)
    if (field === "phone") return v.length >= 10
    if (field === "password") return v.length >= 6
    if (field === "confirm_password") return v === formData.password && v.length > 0
    if (field === "full_name") return v.length >= 2
    return v.length > 0
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) return "Password must be at least 6 characters"
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
    if (Object.keys(newErrors).length > 0) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted relative overflow-hidden">
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Join NeumoAI</h1>
                <p className="text-muted-foreground text-lg">How would you like to use NeumoAI?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {roleCards.map((card) => (
                  <motion.button
                    key={card.role}
                    onClick={() => setSelectedRole(card.role)}
                    className={`relative bg-card rounded-2xl shadow-md border-2 border-transparent p-8 text-left transition-all duration-300 cursor-pointer ${card.bgHover} hover:shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5`}>
                      <card.icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      I'm a {card.title}
                    </h2>
                    <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{card.description}</p>
                    <ul className="space-y-2">
                      {card.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                ))}
              </div>

              <motion.p
                className="text-center text-muted-foreground mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Already have an account?{" "}
                <Link to="/login" className="text-[#ff7757] hover:text-foreground transition-colors font-medium">
                  Sign in
                </Link>
              </motion.p>
            </motion.div>
          )}

          {/* Step 2: Signup Form */}
          {selectedRole && (
            <motion.div
              key="signup-form"
              className="max-w-xl mx-auto bg-card rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <button
                  onClick={() => { setSelectedRole(""); setErrors({}) }}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
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
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  Sign up as {selectedRole === "doctor" ? "Doctor" : "Patient"}
                </h1>
                <p className="text-muted-foreground text-sm">Fill in your details to get started</p>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-5"
                animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {[
                  { id: "full_name", label: "Full Name", type: "text", placeholder: selectedRole === "doctor" ? "Dr. John Smith" : "John Smith", delay: 0.1 },
                  { id: "email", label: "Email", type: "email", placeholder: "you@example.com", delay: 0.15 },
                  { id: "phone", label: "Phone Number", type: "tel", placeholder: "+91 98765 43210", delay: 0.2 },
                  { id: "password", label: "Password", type: "password", placeholder: "At least 6 characters", delay: 0.25, hint: "Must be at least 6 characters" },
                  { id: "confirm_password", label: "Confirm Password", type: "password", placeholder: "Re-enter your password", delay: 0.3 },
                ].map((field) => (
                  <motion.div
                    key={field.id}
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: field.delay }}
                  >
                    <Label htmlFor={field.id}>{field.label}</Label>
                    {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                    <div className="relative">
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id as keyof typeof formData]}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`pr-10 transition-colors ${errors[field.id] ? "border-red-500 focus:ring-red-500" : isFieldValid(field.id) ? "border-green-500 focus:ring-green-500" : ""}`}
                      />
                      {isFieldValid(field.id) && !errors[field.id] && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <AnimatePresence>
                      {errors[field.id] && (
                        <motion.p
                          className="text-red-500 text-xs"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {errors[field.id]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

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
                  className="text-center text-muted-foreground text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#ff7757] hover:text-foreground transition-colors font-medium">
                    Sign in
                  </Link>
                </motion.p>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
