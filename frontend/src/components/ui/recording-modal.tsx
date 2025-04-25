import { motion } from "framer-motion"
import { X, Mic, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "./button"
import { useState, useEffect, useRef } from "react"

interface RecordingModalProps {
  isOpen: boolean
  onClose: () => void
  onRecordingComplete: (audioBlob: Blob) => void
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

export function RecordingModal({ isOpen, onClose, onRecordingComplete, duration }: RecordingModalProps) {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded' | 'error'>('idle')
  const [timeLeft, setTimeLeft] = useState<number>(duration)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setRecordingState('idle')
      setTimeLeft(duration)
      setErrorMessage('')
      setAudioURL(null)
      audioChunksRef.current = []
    } else {
      // Clean up when modal is closed
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [isOpen, duration])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        setRecordingState('recorded')
      }
      
      mediaRecorderRef.current.start()
      setRecordingState('recording')
      
      // Start countdown timer
      setTimeLeft(duration)
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            stopRecording()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
      
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setErrorMessage('Could not access microphone. Please check your browser permissions.')
      setRecordingState('error')
    }
  }
  
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }
  
  const resetRecording = () => {
    setRecordingState('idle')
    setTimeLeft(duration)
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
      setAudioURL(null)
    }
    audioChunksRef.current = []
  }
  
  const handleSubmit = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      onRecordingComplete(audioBlob)
      onClose()
    }
  }

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
            {recordingState === 'idle' && 'Ready to Record'}
            {recordingState === 'recording' && 'Recording in Progress'}
            {recordingState === 'recorded' && 'Recording Completed'}
            {recordingState === 'error' && 'Recording Error'}
          </h3>
          
          {recordingState === 'idle' && (
            <p className="text-gray-600 mb-8">
              Click "Start Recording" and breathe normally for {duration} seconds
            </p>
          )}
          
          {recordingState === 'recording' && (
            <p className="text-gray-600 mb-4">
              Please breathe normally. Time remaining: <span className="font-semibold">{timeLeft} seconds</span>
            </p>
          )}
          
          {recordingState === 'recorded' && (
            <p className="text-gray-600 mb-4">
              Your recording is complete. You can listen to it, try again, or submit.
            </p>
          )}
          
          {recordingState === 'error' && (
            <p className="text-red-500 mb-4">
              {errorMessage}
            </p>
          )}

          {/* Waveform Animation or Audio Player */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            {recordingState === 'recording' && <WaveformBars />}
            
            {recordingState === 'recorded' && audioURL && (
              <div className="flex flex-col items-center">
                <audio ref={audioRef} src={audioURL} controls className="w-full mb-4" />
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Recording saved successfully</span>
                </div>
              </div>
            )}
            
            {recordingState === 'error' && (
              <div className="flex flex-col items-center justify-center h-24">
                <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                <p>Please try again or use file upload instead</p>
              </div>
            )}
            
            {recordingState === 'idle' && (
              <div className="flex flex-col items-center justify-center h-24">
                <Mic className="w-12 h-12 text-[#ff7757] mb-2" />
                <p>Ready to capture your breathing sounds</p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            {recordingState === 'idle' && (
              <Button
                onClick={startRecording}
                className="bg-[#ff7757] hover:bg-[#e85d3d] text-white px-6 py-3 rounded-lg"
              >
                Start Recording
              </Button>
            )}
            
            {recordingState === 'recording' && (
              <Button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                Stop Recording
              </Button>
            )}
            
            {recordingState === 'recorded' && (
              <>
                <Button
                  onClick={resetRecording}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Record Again
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  className="bg-[#ff7757] hover:bg-[#e85d3d] text-white px-6 py-3 rounded-lg"
                >
                  Submit Recording
                </Button>
              </>
            )}
            
            {recordingState === 'error' && (
              <Button
                onClick={resetRecording}
                className="bg-[#ff7757] hover:bg-[#e85d3d] text-white px-6 py-3 rounded-lg"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
} 