import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { HospitalCard } from "@/components/HospitalCard"
import { Skeleton } from "@/components/ui/skeleton"
import apiClient from "@/services/api"

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  description: string
  specialties: string[]
  image_url?: string
  timings: {
    emergency: string
    opd: string
    visiting: string
  }
  directions_url: string
  rating?: number
  beds?: number
}

export default function Hospitals() {
  const [searchQuery, setSearchQuery] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch hospitals from API
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.get<Hospital[]>('/hospitals')
        setHospitals(response.data)
        setFilteredHospitals(response.data)
      } catch (err) {
        console.error('Error fetching hospitals:', err)
        setError('Failed to fetch hospitals. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchHospitals()
  }, [])

  // Filter hospitals based on search criteria
  useEffect(() => {
    let filtered = [...hospitals]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.address.toLowerCase().includes(query) ||
        hospital.specialties.some(s => s.toLowerCase().includes(query))
      )
    }

    if (citySearch) {
      filtered = filtered.filter(hospital =>
        hospital.address.toLowerCase().includes(citySearch.toLowerCase())
      )
    }

    setFilteredHospitals(filtered)
  }, [searchQuery, citySearch, hospitals])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-6 w-64" />
          </div>
          <Skeleton className="h-24 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
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
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find A Hospital</h1>
          <p className="text-xl text-muted-foreground">
            Locate Quality Healthcare Facilities Near You
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-card rounded-2xl p-6 shadow-sm mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Hospital Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search hospitals or specialties..."
                className="pl-4 pr-12 py-6 text-lg rounded-full border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-12 h-12 bg-[#008080] hover:bg-[#006666]"
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
        <p className="text-muted-foreground mb-6">{filteredHospitals.length} hospitals found</p>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map(hospital => (
            <HospitalCard
              key={hospital.id}
              id={hospital.id}
              name={hospital.name}
              image={hospital.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop"}
              address={hospital.address}
              phone={hospital.phone}
              directions_url={hospital.directions_url}
              description={hospital.description}
              specialties={hospital.specialties}
              timings={hospital.timings}
              rating={hospital.rating}
              beds={hospital.beds}
            />
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No hospitals found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
