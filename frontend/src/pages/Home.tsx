import { Navigation } from "../components/sections/Navigation"
import { Hero } from "../components/sections/Hero"
import { About } from "../components/sections/About"
import { Mission } from "../components/sections/Mission"
import { FAQSection } from "../components/ui/faq-section"
import { Footer } from "../components/sections/Footer"
export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <Hero />
      <About />
      <Mission />
      {/* Rest of the sections will be moved to separate components */}
      <FAQSection />
      <Footer />
    </div>
  )
} 