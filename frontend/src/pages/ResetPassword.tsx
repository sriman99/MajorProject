import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { assets } from "../config/assets"
import { motion } from "framer-motion"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { authApi } from "@/services/api"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link")
      navigate("/login")
    }
  }, [token, navigate])

  useEffect(() => {
    // Update password strength indicators
    const password = formData.new_password
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)
    })
  }, [formData.new_password])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.new_password) {
      newErrors.new_password = "Password is required"
    } else if (!Object.values(passwordStrength).every(v => v)) {
      newErrors.new_password = "Password does not meet all requirements"
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password"
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Invalid reset token")
      return
    }

    if (validateForm()) {
      setLoading(true)
      try {
        const response = await authApi.resetPassword({
          token,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password
        })

        toast.success(response.message)

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } catch (error: any) {
        console.error("Reset password error:", error)

        if (error.response?.status === 400) {
          toast.error(error.response.data.detail || "Invalid or expired reset token")
        } else if (error.response?.status === 422) {
          // Handle validation errors
          const detail = error.response.data.detail
          if (Array.isArray(detail)) {
            const firstError = detail[0]
            toast.error(firstError.msg || "Validation error")
          } else if (detail) {
            toast.error(detail)
          }
        } else {
          toast.error("An error occurred. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const StrengthIndicator = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <CheckCircle2 className={`w-4 h-4 mr-2 ${met ? 'fill-green-600' : ''}`} />
      {text}
    </div>
  )

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
          className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8"
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
              className="w-30 h-17 mx-auto mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <h1 className="text-3xl font-bold text-[#1a2352] mb-2">Reset Password</h1>
            <p className="text-gray-600">Create a new secure password</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className={errors.new_password ? "border-red-500 pr-10" : "pr-10"}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.new_password && (
                <motion.p
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.new_password}
                </motion.p>
              )}
            </motion.div>

            {/* Password strength indicators */}
            <motion.div
              className="bg-gray-50 p-4 rounded-lg space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
              <StrengthIndicator met={passwordStrength.length} text="At least 8 characters" />
              <StrengthIndicator met={passwordStrength.uppercase} text="One uppercase letter" />
              <StrengthIndicator met={passwordStrength.lowercase} text="One lowercase letter" />
              <StrengthIndicator met={passwordStrength.number} text="One number" />
              <StrengthIndicator met={passwordStrength.special} text="One special character (!@#$%^&*)" />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className={errors.confirm_password ? "border-red-500 pr-10" : "pr-10"}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <motion.p
                  className="text-red-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.confirm_password}
                </motion.p>
              )}
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
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </motion.div>

            <motion.p
              className="text-center text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#ff7757] hover:text-[#1a2352] transition-colors"
              >
                Sign in
              </button>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
