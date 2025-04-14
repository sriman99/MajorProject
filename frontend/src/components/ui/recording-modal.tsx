import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "./button"

interface RecordingModalProps {
  isOpen: boolean
  onClose: () => void
  onStop: () => void
  duration: number
}

const WaveformBars = () => {
  // Create an array of 40 bars
  const bars = Array.from({ length: 40 })
  
  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {bars.map((_, index) => (
        <motion.div
          key={index}
          className="w-1.5 bg-[#ff7757] rounded-full"
          animate={{
            height: [
              `${Math.random() * 20 + 10}px`,
              `${Math.random() * 60 + 20}px`,
              `${Math.random() * 20 + 10}px`
            ],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.05
          }}
        />
      ))}
    </div>
  )
}

export function RecordingModal({ isOpen, onClose, onStop, duration }: RecordingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-[#1a2352] mb-2">
            Recording in Progress
          </h3>
          <p className="text-gray-600 mb-8">
            Please breathe normally for {duration} seconds
          </p>

          {/* Waveform Animation */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <WaveformBars />
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onStop}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg"
            >
              Stop Recording
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 