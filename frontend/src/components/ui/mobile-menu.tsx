import { useState } from 'react'
import { Button } from './button'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        className="p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-4 space-y-4">
          <a href="#" className="block text-[#1a2352] hover:text-[#ff7757]">Home</a>
          <a href="#features" className="block text-[#1a2352] hover:text-[#ff7757]">Features</a>
          <a href="#testimonials" className="block text-[#1a2352] hover:text-[#ff7757]">Testimonials</a>
          <a href="#how-it-works" className="block text-[#1a2352] hover:text-[#ff7757]">How it works</a>
          <a href="#contact" className="block text-[#1a2352] hover:text-[#ff7757]">Contact</a>
          <Button className="w-full bg-[#ff7757] hover:bg-[#ff7757]/90">Sign Up</Button>
        </div>
      )}
    </div>
  )
} 