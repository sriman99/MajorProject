import { Hero } from "../components/sections/Hero"
import { About } from "../components/sections/About"
import { Mission } from "../components/sections/Mission"
import { FAQSection } from "../components/ui/faq-section"
import { Contact } from "../components/ui/contact"
import { Features } from "../components/sections/Features"
import { Testimonials } from "../components/sections/Testimonials"

export function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      <Hero />
      <About />
      <Mission />
      <Features />
      <Testimonials />
      <FAQSection />
      <Contact />
    </div>
  )
} 