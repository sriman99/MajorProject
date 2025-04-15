import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useState } from "react"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: {
    id: string
    name: string
    timings: {
      hours: string
      days: string
    }
  }
}

export function BookingModal({ isOpen, onClose, doctor }: BookingModalProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    symptoms: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating API call
      setIsSuccess(true)
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({
          patientName: "",
          age: "",
          phone: "",
          email: "",
          date: "",
          time: "",
          symptoms: ""
        })
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Booking failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#1a2352] mb-2">Book Appointment</h2>
          <p className="text-gray-600 mb-6">with {doctor.name}</p>

          {isSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-xl font-semibold mb-2">
                Appointment Booked Successfully!
              </div>
              <p className="text-gray-600">
                We'll send you a confirmation email with all the details.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                <Textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleChange}
                  placeholder="Please describe your symptoms or reason for visit"
                  className="h-24"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-600 mb-4">
                  <p>Available Hours: {doctor.timings.hours}</p>
                  <p>Available Days: {doctor.timings.days}</p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#1a2352] hover:bg-[#1a2352]/90 text-white py-6 rounded-full font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 