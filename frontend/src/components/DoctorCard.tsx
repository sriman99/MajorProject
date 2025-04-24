import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, MessageSquare, Video, Calendar, Languages } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { CallModal } from "./CallModal"
import { CommunicationModal } from "./CommunicationModal"
import { BookingModal } from "./BookingModal"
import { useAuthWithFetch} from "@/hooks/useAuth"

interface DoctorCardProps {
  _id?: string
  id?: string
  name: string
  experience: string
  qualifications: string
  languages: string[]
  specialties: string[]
  gender: "male" | "female"
  image_url: string
  locations: {
    name: string
    isMain?: boolean
  }[]
  timings: {
    hours: string
    days: string
  }
}

export function DoctorCard({
  _id,
  id,
  name,
  experience,
  qualifications,
  languages,
  specialties,
  gender,
  image_url,
  locations,
  timings
}: DoctorCardProps) {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuthWithFetch()
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [callType, setCallType] = useState<"audio" | "video">("video")
  
  // Use id or _id, whichever is available
  const doctorId = id || _id || ""
  
  // Debug user object - will show in console
  useEffect(() => {
    console.log("User in DoctorCard:", user);
    if (user) {
      console.log("User ID field:", user.id);
      console.log("Full user object keys:", Object.keys(user));
    }
  }, [user]);
  
  // Extract user ID safely - trying multiple possible fields
  const userId = user ? (user.id || "") : "";

  const handleStartChat = () => {
    setIsChatModalOpen(true)
  }

  const handleStartVideoCall = () => {
    setCallType("video")
    setIsCallModalOpen(true)
  }

  const handleStartAudioCall = () => {
    setCallType("audio")
    setIsCallModalOpen(true)
  }

  const handleBookAppointment = () => {
    setIsBookingModalOpen(true)
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={image_url} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{experience}</p>
            <p className="text-sm text-gray-500">{qualifications}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Languages */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Languages className="h-4 w-4" />
              <span>{languages.join(', ')}</span>
            </div>

            {/* Locations */}
            {locations.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>{locations[0].name}</span>
              </div>
            )}

            {/* Timings */}
            {timings.hours && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{timings.hours} ({timings.days})</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleStartChat}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleStartVideoCall}
              >
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={handleBookAppointment}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Modal */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        doctorName={name}
        doctorId={doctorId}
        callType={callType}
      />

      {/* Chat Modal */}
      <CommunicationModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        doctor={{
          id: doctorId,
          name: name,
          imageUrl: image_url
        }}
        userId={userId}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctorId={doctorId}
        doctorName={name}
        patientId={userId}
      />
    </>
  )
} 