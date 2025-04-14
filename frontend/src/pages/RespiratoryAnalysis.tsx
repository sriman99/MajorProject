import { useState } from "react"
import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import { Upload, Mic, Activity, AlertCircle } from "lucide-react"
import { RecordingModal } from "../components/ui/recording-modal"

export default function RespiratoryAnalysis() {
  const [isRecording, setIsRecording] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    status: 'normal' | 'warning' | 'critical' | null
    message: string
    details: string[]
  } | null>(null)
  const [recordingDuration] = useState(5) // 5 seconds recording duration

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Simulate analysis
      setTimeout(() => {
        setAnalysisResult({
          status: 'normal',
          message: 'Breathing pattern analysis complete',
          details: [
            'Normal respiratory rate detected',
            'No abnormal sounds identified',
            'Regular breathing pattern observed'
          ]
        })
      }, 2000)
    }
  }

  const startRecording = () => {
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Simulate analysis after recording
    setTimeout(() => {
      setAnalysisResult({
        status: 'warning',
        message: 'Potential irregularity detected',
        details: [
          'Slightly elevated respiratory rate',
          'Mild wheezing detected',
          'Recommend consulting a doctor'
        ]
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-[#1a2352] mb-4">
            Respiratory Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload a recording of your breathing or record it live for AI-powered analysis.
          </p>

          {/* Upload/Record Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Option */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#ff7757] transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-[#ff7757]" />
                <h3 className="text-xl font-semibold text-[#1a2352] mb-2">
                  Upload Recording
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload a WAV file of your breathing sounds
                </p>
                <input
                  type="file"
                  accept=".wav"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-[#ff7757] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Choose File
                </label>
              </div>

              {/* Record Option */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#ff7757] transition-colors">
                <Mic className="w-12 h-12 mx-auto mb-4 text-[#ff7757]" />
                <h3 className="text-xl font-semibold text-[#1a2352] mb-2">
                  Record Live
                </h3>
                <p className="text-gray-600 mb-4">
                  Record your breathing sounds in real-time
                </p>
                <Button
                  onClick={startRecording}
                  className="bg-[#ff7757] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Start Recording
                </Button>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                {analysisResult.status === 'normal' ? (
                  <Activity className="w-8 h-8 text-green-500 mr-3" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" />
                )}
                <h2 className="text-2xl font-bold text-[#1a2352]">
                  {analysisResult.message}
                </h2>
              </div>

              <div className="space-y-4">
                {analysisResult.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#ff7757] mt-2" />
                    <p className="text-gray-700">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  className="bg-[#ff7757] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Schedule Doctor Consultation
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Recording Modal */}
      <RecordingModal
        isOpen={isRecording}
        onClose={() => setIsRecording(false)}
        onStop={stopRecording}
        duration={recordingDuration}
      />
    </div>
  )
} 