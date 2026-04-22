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
      <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <CardHeader className="flex flex-col items-center text-center pb-2">
          <Avatar className="h-24 w-24 mb-3 ring-4 ring-[#008080]/10">
            <AvatarImage src={image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=200`} alt={name} />
            <AvatarFallback className="text-xl">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl text-foreground">{name}</CardTitle>
          <p className="text-sm text-[#008080] font-medium mt-1">{experience}</p>
          <p className="text-xs text-muted-foreground">{qualifications}</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-3">
            {specialties.slice(0, 2).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs bg-[#008080]/10 text-[#008080] hover:bg-[#008080]/20">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-secondary text-muted-foreground">
                +{specialties.length - 2}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-2">
          <div className="space-y-2 flex-1">
            {/* Languages */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Languages className="h-3.5 w-3.5 text-[#008080]" />
              <span className="truncate">{languages.join(', ')}</span>
            </div>

            {/* Locations */}
            {locations.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#008080]" />
                <span className="truncate">{locations[0].name}</span>
              </div>
            )}

            {/* Timings */}
            {timings.hours && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-[#008080]" />
                <span className="truncate">{timings.hours} ({timings.days})</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 pt-4 mt-auto border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center py-2 h-auto text-xs hover:bg-[#008080]/5 hover:text-[#008080] hover:border-[#008080]"
              onClick={handleStartChat}
            >
              <MessageSquare className="h-4 w-4 mb-1" />
              Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center py-2 h-auto text-xs hover:bg-[#008080]/5 hover:text-[#008080] hover:border-[#008080]"
              onClick={handleStartVideoCall}
            >
              <Video className="h-4 w-4 mb-1" />
              Video
            </Button>
            <Button
              size="sm"
              className="flex flex-col items-center py-2 h-auto text-xs bg-[#008080] hover:bg-[#006666]"
              onClick={handleBookAppointment}
            >
              <Calendar className="h-4 w-4 mb-1" />
              Book
            </Button>
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