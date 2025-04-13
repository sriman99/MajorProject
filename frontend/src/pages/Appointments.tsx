import { DoctorCard } from "../components/DoctorCard"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Search } from "lucide-react"
import { useState, useEffect } from "react"

const SPECIALTIES = [
  "Cardiology",
  "Cosmetology & Plastic Surgery",
  "Critical Care & Emergency Medicine",
  "Dentistry",
  "Dermatology",
  "Endocrinology & Diabetes Care",
  "ENT (Ear, Nose, Throat)",
  "General Medicine",
  "Nephrology",
  "Respiratory Medicine",
  "Pulmonology"
]

const DOCTORS = [
  {
    id: "doc_1",
    name: "Dr A Anitha",
    experience: "16+ Years Experience",
    qualifications: "MBBS, DNB (General Medicine), DNB (Nephrology) | Nephrology",
    languages: ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"],
    locations: [
      {
        name: "Apollo Speciality Hospital, Jayanagar",
        isMain: true
      }
    ],
    timings: {
      hours: "14:00 -16:00",
      days: "Mon - Sat"
    },
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&h=400&fit=crop",
    gender: "female",
    specialties: ["Nephrology", "General Medicine"]
  },
  {
    id: "doc_2",
    name: "Dr A D Suri",
    experience: "17+ Years Experience",
    qualifications: "MBBS, MD - General Medicine | Respiratory Medicine",
    languages: ["English", "Hindi", "Punjabi"],
    locations: [
      {
        name: "Apollo Hospitals, Bannerghatta Road",
        isMain: true
      }
    ],
    timings: {
      hours: "10:00 -13:00",
      days: "Mon - Fri"
    },
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&h=400&fit=crop",
    gender: "male",
    specialties: ["Respiratory Medicine", "General Medicine"]
  },
  {
    id: "doc_3",
    name: "Dr Sarah Johnson",
    experience: "12+ Years Experience",
    qualifications: "MBBS, MD - Pulmonology | Respiratory Care",
    languages: ["English", "Spanish"],
    locations: [
      {
        name: "Apollo Hospitals, Koramangala",
        isMain: true
      }
    ],
    timings: {
      hours: "15:00 -19:00",
      days: "Mon - Sat"
    },
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&h=400&fit=crop",
    gender: "female",
    specialties: ["Pulmonology", "Respiratory Medicine"]
  },
  {
    id: "doc_4",
    name: "Dr Michael Chen",
    experience: "20+ Years Experience",
    qualifications: "MBBS, MD - Internal Medicine, DM - Pulmonology",
    languages: ["English", "Mandarin", "Cantonese"],
    locations: [
      {
        name: "Apollo Hospitals, Indira Nagar",
        isMain: true
      }
    ],
    timings: {
      hours: "09:00 -14:00",
      days: "Mon - Sat"
    },
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&h=400&fit=crop",
    gender: "male",
    specialties: ["Pulmonology", "Internal Medicine"]
  }
]

export default function Appointments() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGender, setSelectedGender] = useState("any")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [specialtySearch, setSpecialtySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [sortBy, setSortBy] = useState<"experience" | "name">("name")
  const [filteredDoctors, setFilteredDoctors] = useState(DOCTORS)

  // Filter doctors based on all criteria
  useEffect(() => {
    let filtered = [...DOCTORS]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(query) ||
        doctor.qualifications.toLowerCase().includes(query) ||
        doctor.specialties.some(s => s.toLowerCase().includes(query))
      )
    }

    // Gender filter
    if (selectedGender !== "any") {
      filtered = filtered.filter(doctor => doctor.gender === selectedGender)
    }

    // Specialties filter
    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter(doctor =>
        doctor.specialties.some(specialty => selectedSpecialties.includes(specialty))
      )
    }

    // City filter
    if (citySearch) {
      filtered = filtered.filter(doctor =>
        doctor.locations.some(location => 
          location.name.toLowerCase().includes(citySearch.toLowerCase())
        )
      )
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "experience") {
        return parseInt(b.experience) - parseInt(a.experience)
      }
      return a.name.localeCompare(b.name)
    })

    setFilteredDoctors(filtered)
  }, [searchQuery, selectedGender, selectedSpecialties, citySearch, sortBy])

  // Filter visible specialties based on search
  const filteredSpecialties = SPECIALTIES.filter(specialty =>
    specialty.toLowerCase().includes(specialtySearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1a2352] mb-2">Find A Doctor</h1>
          <p className="text-xl text-gray-600">
            Connect with Trusted Healthcare Experts for Personalized Care
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search for Doctors & Specialities...."
            className="w-full pl-4 pr-12 py-6 text-lg rounded-full border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-[#008080] hover:bg-[#006666]"
          >
            <Search className="w-6 h-6 text-white" />
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters Section */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#1a2352] mb-6">Filters</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a2352] mb-4">Gender</h3>
                <div className="space-y-3">
                  {["Any", "Male", "Female"].map((gender) => (
                    <label key={gender} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={gender.toLowerCase()}
                        checked={selectedGender === gender.toLowerCase()}
                        onChange={(e) => setSelectedGender(e.target.value)}
                        className="text-[#008080]" 
                      />
                      <span className="text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1a2352] mb-4">Specialities</h3>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search Speciality"
                    className="mb-4"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                  />
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSpecialties.map((specialty) => (
                    <label key={specialty} className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        checked={selectedSpecialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSpecialties([...selectedSpecialties, specialty])
                          } else {
                            setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty))
                          }
                        }}
                        className="rounded border-gray-300" 
                      />
                      <span className="text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1a2352] mb-4">Select City</h3>
                <Input
                  type="text"
                  placeholder="Search City"
                  className="w-full"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">{filteredDoctors.length} doctors found</p>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => setSortBy(sortBy === "name" ? "experience" : "name")}
              >
                Sort by {sortBy === "name" ? "Experience" : "Name"} ▼
              </Button>
            </div>

            <div className="space-y-4">
              {filteredDoctors.map((doctor, index) => (
                <DoctorCard 
                  key={index} 
                  {...doctor}
                  gender={doctor.gender as "male" | "female"} 
                />
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No doctors found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 