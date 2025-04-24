import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Check, X, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface AppointmentStatusUpdateProps {
  appointmentId: string
  currentStatus: string
  onStatusUpdate: () => void
}

export function AppointmentStatusUpdate({ 
  appointmentId, 
  currentStatus, 
  onStatusUpdate 
}: AppointmentStatusUpdateProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const statusOptions = [
    { value: "pending", label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Confirmed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800" },
    { value: "completed", label: "Completed", icon: Check, color: "bg-blue-100 text-blue-800" }
  ]

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        toast.error("Authentication token missing. Please log in again.")
        return
      }

      const response = await axios.put(
        `http://localhost:8000/appointments/${appointmentId}?status=${newStatus}`, 
        {}, // Empty request body, since we're sending status as a query parameter
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.status === 200) {
        toast.success(`Appointment status updated to ${newStatus}`)
        onStatusUpdate() // Refresh appointment data
        setOpen(false)
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
      toast.error("Failed to update appointment status")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(option => option.value === status) || statusOptions[0]
    const StatusIcon = statusOption.icon
    
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusOption.color}`}>
        <StatusIcon className="h-3 w-3" />
        <span className="text-xs font-medium">{statusOption.label}</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Appointment Status</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Current status:</p>
            <div className="mt-1">{getStatusBadge(currentStatus)}</div>
          </div>
          
          <p className="text-sm font-medium mb-3">Select new status:</p>
          
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                className={`justify-start ${
                  currentStatus === option.value ? "border-2 border-primary" : ""
                }`}
                onClick={() => handleUpdateStatus(option.value)}
                disabled={isLoading || currentStatus === option.value}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 