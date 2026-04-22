import { useState, type ChangeEvent } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { assets } from "../../config/assets"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin } from "lucide-react"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.subject) newErrors.subject = "Subject is required"
    if (!formData.message) newErrors.message = "Message is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validateForm()) {
      // Handle form submission
      console.log("Form submitted:", formData)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted relative overflow-hidden transition-all duration-300" id="contact">
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

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions about our services? We're here to help. Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start space-x-4">
                <div className="bg-[#ff7757]/10 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-[#ff7757]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Email Us</h3>
                  <p className="text-muted-foreground">support@neumoai.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#ff7757]/10 p-3 rounded-full">
                  <Phone className="w-6 h-6 text-[#ff7757]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Call Us</h3>
                  <p className="text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#ff7757]/10 p-3 rounded-full">
                  <MapPin className="w-6 h-6 text-[#ff7757]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Visit Us</h3>
                  <p className="text-muted-foreground">123 Health Street, Medical City, MC 12345</p>
                </div>
              </div>
            </motion.div>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <motion.p 
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={errors.subject ? "border-red-500" : ""}
                />
                {errors.subject && (
                  <motion.p 
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.subject}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={errors.message ? "border-red-500" : ""}
                  rows={5}
                />
                {errors.message && (
                  <motion.p 
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {errors.message}
                  </motion.p>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#1a2352] to-[#ff7757] hover:from-[#ff7757] hover:to-[#1a2352] text-white py-6 text-lg transition-all duration-300"
                >
                  Send Message
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 