import { DoctorCard } from "../components/DoctorCard"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthWithFetch } from "@/hooks/useAuth"
interface Doctor {
  _id: string
  name: string
  experience: string
  qualifications: string
  languages: string[]
  specialties: string[]
  gender: string
  image_url: string
  user_id: string
  id: string
  locations: any[]
  timings: {
    hours: string
    days: string
  }
}

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
  "Pulmonology",
  "Gynacologist"
]

export default function Appointments() {
  // State for filters
  const { user} = useAuthWithFetch()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGender, setSelectedGender] = useState("any")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [specialtySearch, setSpecialtySearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [sortBy, setSortBy] = useState<"experience" | "name">("name")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axios.get('http://localhost:8000/doctors')
        setDoctors(response.data)
        setFilteredDoctors(response.data)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError('Failed to fetch doctors. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Filter doctors based on all criteria
  useEffect(() => {
    let filtered = [...doctors]

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
  }, [searchQuery, selectedGender, selectedSpecialties, citySearch, sortBy, doctors])

  // Filter visible specialties based on search
  const filteredSpecialties = SPECIALTIES.filter(specialty =>
    specialty.toLowerCase().includes(specialtySearch.toLowerCase())
  )

  // Handle specialty search
  const handleSpecialtySearch = async (specialty: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`http://localhost:8000/doctors?specialty=${specialty}`)
      setDoctors(response.data)
      setFilteredDoctors(response.data)
    } catch (err) {
      console.error('Error searching doctors by specialty:', err)
      setError('Failed to search doctors. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-96 mb-2" />
            <Skeleton className="h-6 w-72" />
          </div>
          <div className="flex gap-8">
            <div className="w-72">
              <Skeleton className="h-[600px] rounded-lg" />
            </div>
            <div className="flex-1 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

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
                            handleSpecialtySearch(specialty)
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
              {filteredDoctors.map((doctor) => (
                <DoctorCard 
                  key={doctor.id} 
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