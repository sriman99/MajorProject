import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin } from "lucide-react"
import { useState } from "react"
import { HospitalCard } from "@/components/HospitalCard"

// Sample data - In a real app, this would come from an API
const HOSPITALS = [
  {
    id: "adlux-1",
    name: "Apollo Adlux Hospital",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2960&auto=format&fit=crop", // Placeholder image
    address: "Cable Junction, Ernakulam District, National Highway 47, Karukutty, Cochin, Kerala - 683576",
    phone: "+91 484 7185000",
    directions_url: "https://maps.google.com/?q=Apollo+Adlux+Hospital",
    description: "Apollo Adlux Hospital is a state-of-the-art multi-specialty hospital committed to providing world-class healthcare services.",
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    timings: {
      emergency: "24/7",
      opd: "Mon-Sat: 9:00 AM - 6:00 PM",
      visiting: "11:00 AM - 1:00 PM, 4:00 PM - 6:00 PM"
    }
  },
  {
    id: "banner-1",
    name: "Apollo Hospitals Bannerghatta",
    image: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=2960&auto=format&fit=crop", // Placeholder image
    address: "154/11, Bannerghatta Road, Amalodbhavi Nagar, Panduranga Nagar, Bangalore - 560076",
    phone: "+91 804 073 3333",
    directions_url: "https://maps.google.com/?q=Apollo+Hospitals+Bannerghatta",
    description: "Apollo Hospitals Bannerghatta is equipped with the latest technology and expert healthcare professionals.",
    specialties: ["Pediatrics", "General Surgery", "Emergency Medicine"],
    timings: {
      emergency: "24/7",
      opd: "Mon-Sat: 8:00 AM - 8:00 PM",
      visiting: "10:00 AM - 1:00 PM, 4:00 PM - 7:00 PM"
    }
  },
  {
    id: "spec-1",
    name: "Apollo Speciality Hospital",
    image: "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=2960&auto=format&fit=crop", // Placeholder image
    address: "32nd Street, 6th Block, Jayanagar, Bangalore - 560082",
    phone: "+91 804 164 7001",
    directions_url: "https://maps.google.com/?q=Apollo+Speciality+Hospital+Jayanagar",
    description: "Apollo Speciality Hospital focuses on providing specialized care with advanced medical procedures.",
    specialties: ["Oncology", "Gastroenterology", "Urology"],
    timings: {
      emergency: "24/7",
      opd: "Mon-Sat: 9:00 AM - 7:00 PM",
      visiting: "10:30 AM - 1:30 PM, 4:30 PM - 7:30 PM"
    }
  }
]

export default function Hospitals() {
  const [searchQuery, setSearchQuery] = useState("")
  const [citySearch, setCitySearch] = useState("")

  // Filter hospitals based on search criteria
  const filteredHospitals = HOSPITALS.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = citySearch === "" || hospital.address.toLowerCase().includes(citySearch.toLowerCase())
    return matchesSearch && matchesCity
  })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1a2352] mb-2">Find A Hospital</h1>
          <p className="text-xl text-gray-600">
            Locate Apollo Hospitals Near You
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Hospital Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search hospitals..."
                className="pl-4 pr-12 py-6 text-lg rounded-full border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-[#1a2352] hover:bg-[#1a2352]/90"
              >
                <Search className="w-6 h-6 text-white" />
              </Button>
            </div>

            {/* City Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter city..."
                className="pl-12 pr-4 py-6 text-lg rounded-full border-gray-200"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-6">{filteredHospitals.length} hospitals found</p>

        {/* Hospitals List */}
        <div className="max-w-6xl mx-auto space-y-6">
          {filteredHospitals.map(hospital => (
            <HospitalCard
              key={hospital.id}
              {...hospital}
            />
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hospitals found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
} 