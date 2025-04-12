import { Hero } from "../components/sections/Hero"
import { About } from "../components/sections/About"
import { Mission } from "../components/sections/Mission"
import { FAQSection } from "../components/ui/faq-section"
import { Contact } from "../components/ui/contact"
export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      
      <Hero />
      <About />
      <Mission />
      <FAQSection />
      <Contact />
    </div>
  )
} 