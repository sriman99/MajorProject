import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: string
  doctorName: string
  patientId: string
}

export function BookingModal({ isOpen, onClose, doctorId, doctorName, patientId }: BookingModalProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { isLoggedIn } = useAuth()

  console.log("BookingModal props:", { doctorId, doctorName, patientId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('access_token')
    console.log("Token present:", !!token);
    console.log("Submitting appointment with:", { doctorId, patientId, date, time, reason });
    
    // Validate all required fields
    const validationErrors = [];
    if (!date) validationErrors.push("Date is required");
    if (!time) validationErrors.push("Time is required");
    if (!reason) validationErrors.push("Reason is required");
    if (!doctorId) validationErrors.push("Doctor information is missing");
    if (!patientId) validationErrors.push("Patient information is missing");
    if (!token) validationErrors.push("Authentication token is missing");
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(", "));
      console.error("Validation errors:", validationErrors);
      return;
    }

    if (!isLoggedIn) {
      toast.error("Please log in to book an appointment")
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      
      // Create appointment data exactly matching the Pydantic model
      const appointmentData = {
        doctor_id: doctorId,
        patient_id: patientId,
        date: date,
        time: time,
        reason: reason,
        status: "pending"
      }
      
      console.log('Sending appointment data:', appointmentData)
      console.log('Using token:', token ? 'Token present' : 'No token')
      
      const response = await axios.post("http://localhost:8000/appointments", appointmentData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response received:', response.data)

      if (response.status === 200) {
        toast.success("Appointment booked successfully!")
        onClose()
        // Reset form
        setDate("")
        setTime("")
        setReason("")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Please log in to book an appointment")
        } else if (error.response?.status === 422) {
          console.error("Validation error details:", error.response.data)
          toast.error("Invalid appointment data. Please check your input.")
        } else if (error.response?.status === 400) {
          toast.error(error.response.data.detail || "Failed to book appointment")
        } else {
          toast.error("Failed to book appointment. Please try again.")
        }
      } else {
        toast.error("Failed to book appointment. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Appointment with {doctorName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time
              </label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for Visit
              </label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for visit..."
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 