import { Button } from "@/components/ui/button"
import { MapPin, Share2, Phone, X, Clock, Navigation } from "lucide-react"
import { useState } from "react"

interface HospitalCardProps {
  id: string
  name: string
  image: string
  address: string
  phone: string
  directions_url?: string
  description: string
  specialties: string[]
  timings: {
    emergency: string
    opd: string
    visiting: string
  }
}

export function HospitalCard({
  id,
  name,
  image,
  address,
  phone,
  directions_url,
  description,
  specialties,
  timings
}: HospitalCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    symptoms: ""
  })

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking submission here
    setShowBooking(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="flex gap-4 p-7">
          {/* Left - Image */}
          <div className="w-55 h-55 flex-shrink-0">
            <img 
              src={image} 
              alt={name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          {/* Right - Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-bold text-[#1a2352]">{name}</h2>
              <button 
                className="flex-shrink-0 bg-white p-1.5 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => navigator.share({ title: name, url: window.location.href })}
              >
                <Share2 className="w-6 h-6 text-[#1a2352]" />
              </button>
            </div>

            <div className="mt-2 flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <p className="text-md line-clamp-2">{address}</p>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[#1a2352]">
              <Phone className="w-4 h-4" />
              <a 
                href={`tel:${phone}`}
                className="text-md font-medium hover:underline"
              >
                {phone}
              </a>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[#1a2352]">
              <Navigation className="w-4 h-4" />
            {directions_url && (
              <a 
                href={directions_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[#008080] text-md font-medium hover:underline"
              >
                Get Hospital Directions
              </a>
            )}
            </div>
            

            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-50 h-13 mr-3 border-[1px] border-[#1a2352] text-[#1a2352] hover:bg-[#1a2352]/5 rounded-full text-sm py-2"
                onClick={() => setShowDetails(true)}
              >
                KNOW MORE →
              </Button>
              <Button 
                className="w-50 h-13 bg-[#1a2352] hover:bg-[#1a2352]/90 text-white rounded-full text-sm py-2"
                onClick={() => setShowBooking(true)}
              >
                BOOK NOW →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Know More Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1a2352]">{name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#1a2352] mb-2">About Hospital</h3>
                  <p className="text-gray-600">{description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1a2352] mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="bg-[#1a2352]/5 text-[#1a2352] px-3 py-1 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#1a2352] mb-2">Timings</h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Emergency:</span> {timings.emergency}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">OPD Hours:</span> {timings.opd}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Visiting Hours:</span> {timings.visiting}
                    </p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#1a2352] hover:bg-[#1a2352]/90 text-white rounded-full py-4"
                  onClick={() => {
                    setShowDetails(false)
                    setShowBooking(true)
                  }}
                >
                  BOOK APPOINTMENT →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1a2352] mb-2">Book Appointment</h2>
                  <p className="text-gray-600">at {name}</p>
                </div>
                <button
                  onClick={() => setShowBooking(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352]"
                      value={formData.patientName}
                      onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352]"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352]"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352]"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352]"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352]"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a2352]/20 focus:border-[#1a2352] h-24"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Available Hours: {timings.opd}</p>
                    <p>Available Days: {timings.visiting}</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#1a2352] hover:bg-[#1a2352]/90 text-white rounded-full py-4"
                  >
                    Confirm Booking →
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 