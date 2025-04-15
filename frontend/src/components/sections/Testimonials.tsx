import { motion } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Pulmonologist, Mayo Clinic",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&auto=format",
    content: "This respiratory analysis system has revolutionized how we monitor our patients. The real-time data and accurate predictions have been invaluable in early detection of respiratory issues.",
    rating: 5
  },
  {
    name: "Dr. Michael Chen",
    role: "Critical Care Specialist, Johns Hopkins",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&auto=format",
    content: "The system's ability to detect early warning signs has helped us prevent several critical situations. It's become an essential tool in our ICU, reducing response times significantly.",
    rating: 5
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Respiratory Therapist, Cleveland Clinic",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format",
    content: "As a respiratory therapist, I appreciate the detailed analysis and user-friendly interface. It's made my job much more efficient and improved patient outcomes.",
    rating: 5
  },
  {
    name: "Dr. James Wilson",
    role: "Medical Director, Stanford Hospital",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&auto=format",
    content: "The integration of AI in respiratory monitoring has been a game-changer. The system's accuracy and reliability have exceeded our expectations.",
    rating: 5
  },
  {
    name: "Dr. Lisa Park",
    role: "Research Director, Harvard Medical",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&auto=format",
    content: "The comprehensive data analysis capabilities have significantly advanced our research in respiratory diseases. A truly innovative solution.",
    rating: 5
  }
]

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 3

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= testimonials.length ? 0 : prevIndex + itemsPerPage
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - itemsPerPage < 0 ? testimonials.length - itemsPerPage : prevIndex - itemsPerPage
    )
  }

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Trusted by leading healthcare professionals worldwide</p>
        </motion.div>

        <div className="relative">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 ring-2 ring-blue-100">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.content}</p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex justify-center mt-12">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View More Testimonials
          </button>
        </div>
      </div>
    </section>
  )
} 