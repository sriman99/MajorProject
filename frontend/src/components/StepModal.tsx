import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { LucideIcon } from "lucide-react"
import React from "react"

interface StepModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  image: string
  Icon: LucideIcon
  details: React.ReactNode
  index: number
}

export function StepModal({
  isOpen,
  onClose,
  title,
  description,
  image,
  Icon,
  details,
  index
}: StepModalProps) {
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
  
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 25,
        delay: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      transition: { 
        duration: 0.2 
      } 
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <motion.div 
            className="fixed inset-0 bg-black/50" 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          
          <motion.div 
            className="z-50 w-full max-w-md md:max-w-2xl rounded-lg bg-white p-0 shadow-lg overflow-y-auto max-h-[90vh]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative flex flex-col overflow-hidden rounded-lg">
              {/* Compact Header with Image */}
              <div className="relative h-36 md:h-48 overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-2 right-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose} 
                    className="rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center">
                  <div className="bg-white rounded-full p-2 shadow-lg mr-2">
                    <Icon className="w-5 h-5 text-[#ff7757]" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    Step {index + 1}: {title}
                  </h2>
                </div>
              </div>
              
              {/* Compact Content */}
              <div className="p-4 md:p-5">
                <p className="text-sm md:text-base text-gray-700 mb-4">{description}</p>
                
                <div className="space-y-4 text-sm overflow-y-auto">
                  {details}
                </div>
                
                <div className="mt-5 flex justify-end">
                  <Button onClick={onClose} size="sm">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 