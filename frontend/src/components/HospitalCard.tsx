import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, X, Clock, Navigation, Star, Building2 } from "lucide-react"
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
  rating?: number
  beds?: number
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
  timings,
  rating,
  beds
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
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {rating && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-800">{rating}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h2 className="text-xl font-bold text-white line-clamp-1">{name}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Address */}
          <div className="flex items-start gap-2 text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#008080]" />
            <p className="text-sm line-clamp-2">{address}</p>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4 text-[#008080]" />
            <a
              href={`tel:${phone}`}
              className="text-sm font-medium text-[#1a2352] hover:text-[#008080] transition-colors"
            >
              {phone}
            </a>
          </div>

          {/* Beds Info */}
          {beds && (
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-[#008080]" />
              <span className="text-sm text-gray-600">{beds} beds available</span>
            </div>
          )}

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.slice(0, 3).map((specialty, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-[#008080]/10 text-[#008080] hover:bg-[#008080]/20"
              >
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{specialties.length - 3}
              </Badge>
            )}
          </div>

          {/* Emergency Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Emergency: {timings.emergency}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-[#008080] text-[#008080] hover:bg-[#008080]/5"
              onClick={() => setShowDetails(true)}
            >
              Know More
            </Button>
            <Button
              size="sm"
              className="text-xs bg-[#008080] hover:bg-[#006666] text-white"
              onClick={() => setShowBooking(true)}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Know More Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={image}
                alt={name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h2 className="text-2xl font-bold text-white">{name}</h2>
                {rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold">{rating}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1a2352] mb-2">About Hospital</h3>
                <p className="text-gray-600">{description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1a2352] mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-1 text-[#008080]" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#008080]" />
                    <a href={`tel:${phone}`} className="hover:text-[#008080]">{phone}</a>
                  </div>
                  {directions_url && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Navigation className="w-4 h-4 text-[#008080]" />
                      <a
                        href={directions_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#008080] hover:underline"
                      >
                        Get Directions
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1a2352] mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-[#008080]/10 text-[#008080] px-3 py-1 rounded-full text-sm"
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
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="font-medium">Emergency:</span> {timings.emergency}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#008080]" />
                    <span className="font-medium">OPD Hours:</span> {timings.opd}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#008080]" />
                    <span className="font-medium">Visiting Hours:</span> {timings.visiting}
                  </p>
                </div>
              </div>

              {beds && (
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <Building2 className="w-5 h-5 text-[#008080]" />
                  <span className="font-medium">{beds} beds</span>
                  <span className="text-gray-500">available in this facility</span>
                </div>
              )}

              <Button
                className="w-full bg-[#008080] hover:bg-[#006666] text-white rounded-full py-4"
                onClick={() => {
                  setShowDetails(false)
                  setShowBooking(true)
                }}
              >
                BOOK APPOINTMENT
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
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
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080]"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] h-24"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    placeholder="Describe your symptoms or reason for visit..."
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-medium">OPD Hours:</span> {timings.opd}</p>
                    <p><span className="font-medium">Visiting Hours:</span> {timings.visiting}</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#008080] hover:bg-[#006666] text-white rounded-full py-4"
                  >
                    Confirm Booking
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
