import { Button } from "@/components/ui/button"
import { Phone, Video, MessageCircle } from "lucide-react"
import { useState } from "react"
import { CommunicationModal } from "./CommunicationModal"
import { BookingModal } from "./BookingModal"
import { CallModal } from "./CallModal"

interface DoctorCardProps {
  id: string
  name: string
  experience: string
  qualifications: string
  languages: string[]
  locations: {
    name: string
    isMain: boolean
  }[]
  timings: {
    hours: string
    days: string
  }
  imageUrl: string
  gender: "male" | "female"
  specialties: string[]
}

export function DoctorCard({
  id,
  name,
  experience,
  qualifications,
  languages,
  locations,
  timings,
  imageUrl,
  gender,
  specialties
}: DoctorCardProps) {
  const [showCommunication, setShowCommunication] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [showCall, setShowCall] = useState(false)
  const [callType, setCallType] = useState<"audio" | "video">("audio")

  const handleCall = (type: "audio" | "video") => {
    setCallType(type)
    setShowCall(true)
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-100 p-6 flex gap-8">
        {/* Left Section - Image */}
        <div className="w-50 h-55 flex-shrink-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        
        {/* Middle Section - Doctor Info */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-[#1a2352]">{name}</h2>
            <p className="text-[#008080] font-medium">{experience}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 font-medium">{qualifications}</p>
            <p className="text-gray-600">{languages.join(" | ")}</p>
          </div>

          <div className="space-y-2">
            {locations.map((location, index) => (
              <div key={index} className="text-gray-800">
                {location.name}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button 
              variant="outline" 
              className="flex-1 mr-2 border-2 border-[#1a2352] text-[#1a2352] hover:bg-[#1a2352]/10 rounded-full"
              onClick={() => handleCall("video")}
            >
              <Video className="w-4 h-4 mr-2" />
              Video Call
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-2 border-[#1a2352] text-[#1a2352] hover:bg-[#1a2352]/10 rounded-full"
              onClick={() => setShowCommunication(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>

        {/* Right Section - Timing and Book */}
        <div className="flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-xl font-bold text-[#1a2352]">{timings.hours}</p>
            <p className="text-gray-600">{timings.days}</p>
          </div>

          <Button 
            className="bg-[#1a2352] hover:bg-[#1a2352]/90 text-white px-8 py-6 rounded-full font-semibold"
            onClick={() => setShowBooking(true)}
          >
            BOOK APPOINTMENT →
          </Button>
        </div>
      </div>

      <CommunicationModal
        isOpen={showCommunication}
        onClose={() => setShowCommunication(false)}
        doctor={{ id, name, imageUrl }}
        userId="user123"
      />

      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        doctor={{ id, name, timings }}
      />

      <CallModal
        isOpen={showCall}
        onClose={() => setShowCall(false)}
        doctorName={name}
        doctorId={id}
        callType={callType}
      />
    </>
  )
} 