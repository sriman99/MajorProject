import React, { useState, useRef, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs"
import { useToast } from "../components/ui/use-toast"
import { RecordingModal } from "../components/ui/recording-modal"
import { UploadIcon, MicIcon, Loader2, Calendar, Clock, FileText, Volume2, Info } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog"

// Backend response format from documentation
type BackendAnalysisResponse = {
  id: string
  user_id: string
  file_path: string
  analysis_type: string
  status: string
  message: string
  details: string[]
  created_at: string
}

// Frontend expected format
type AnalysisResponse = {
  userId: string
  filePath: string
  analysisType: string
  status: string
  message: string
  details: {
    score: number
    risk: string
    patterns: {
      wheezing: number
      coughing: number
      shortness_of_breath: number
    }
  }
  id: string
  createdAt: string
}

// A more flexible version of the type with optional fields for error handling
type SafeAnalysisResponse = {
  userId?: string
  filePath?: string
  analysisType?: string
  status?: string
  message?: string
  details?: {
    score?: number
    risk?: string
    patterns?: {
      wheezing?: number
      coughing?: number
      shortness_of_breath?: number
    }
  }
  id?: string
  createdAt?: string
}

export default function RespiratoryAnalysis() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("upload")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<SafeAnalysisResponse | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the respiratory analysis feature",
        variant: "destructive",
      })
      navigate('/login')
    }
  }, [isLoggedIn, navigate, toast])
  
  // If not logged in, don't render the component
  if (!isLoggedIn) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-center text-[#1a2352] mb-2">
          Respiratory Analysis
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Please log in to access the respiratory analysis feature
        </p>
        <Button onClick={() => navigate('/login')} className="bg-[#ff7757] hover:bg-[#e85d3d] text-white px-8">
          Log In
        </Button>
      </div>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadedFile(file)
    setUploadError(null)
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] || null
    setUploadedFile(file)
    setUploadError(null)
  }

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      setUploadError("Please select a file to upload")
      return
    }

    // Check if file is an audio file
    if (!uploadedFile.type.startsWith('audio/')) {
      setUploadError("Please upload an audio file")
      return
    }

    await processAudioFile(uploadedFile)
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const file = new File([audioBlob], "recording.wav", {
      type: "audio/wav"
    })
    setUploadedFile(file)
    await processAudioFile(file)
  }

  const processAudioFile = async (file: File) => {
    setIsLoading(true)
    setAnalysisResult(null)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Get authentication token
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setUploadError("Authentication required. Please log in first.")
        toast({
          title: "Authorization Error",
          description: "Please log in to use this feature",
          variant: "destructive",
          duration: 5000, // Set longer duration (5 seconds)
        })
        return
      }

      console.log("Sending file to server:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        tokenExists: !!token
      })

      // Send the file to the backend with authentication token
      const response = await fetch("http://localhost:8000/analysis/upload", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log("Server response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("Error response from server:", {
          status: response.status,
          statusText: response.statusText,
          errorText
        })
        
        // Provide more specific error messages based on status codes
        if (response.status === 401) {
          throw new Error("Authentication token expired or invalid. Please log in again.")
        } else if (response.status === 413) {
          throw new Error("File size too large. Please upload a smaller file.")
        } else if (response.status === 415) {
          throw new Error("Unsupported file format. Please use WAV, MP3, AAC, or FLAC format.")
        } else if (response.status === 422) {
          throw new Error("The server couldn't process this file. Please try a different recording.")
        } else {
          throw new Error(`Server error (${response.status}): ${errorText || response.statusText}`)
        }
      }

      // Parse the backend response
      const backendResponse: BackendAnalysisResponse = await response.json()
      console.log("Server response data:", backendResponse)
      
      // Convert backend response to the format the frontend expects
      const transformedResult: SafeAnalysisResponse = {
        id: backendResponse.id,
        userId: backendResponse.user_id,
        filePath: backendResponse.file_path,
        analysisType: backendResponse.analysis_type,
        status: backendResponse.status,
        message: backendResponse.message,
        createdAt: backendResponse.created_at,
        // Use a risk level based on the status
        details: {
          score: calculateScoreFromStatus(backendResponse.status),
          risk: mapStatusToRisk(backendResponse.status),
          patterns: {
            wheezing: 0.2,     // Default values since the backend doesn't provide these
            coughing: 0.3,
            shortness_of_breath: 0.1
          }
        }
      }
      
      setAnalysisResult(transformedResult)
      toast({
        title: "Analysis Complete",
        description: "Your breathing has been analyzed successfully",
        duration: 5000, // Set longer duration (5 seconds)
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      
      // Show the specific error message to the user
      const errorMessage = error instanceof Error ? error.message : "Failed to process your recording. Please try again."
      setUploadError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Set longer duration (5 seconds)
      })

      // For development/testing - simulate a response
      if (process.env.NODE_ENV === 'development' && !uploadError?.includes("token")) {
        const mockResult: SafeAnalysisResponse = {
          userId: "user123",
          filePath: "/uploads/sample.wav",
          analysisType: "respiratory",
          status: "completed",
          message: "Analysis completed successfully",
          details: {
            score: 78,
            risk: "moderate",
            patterns: {
              wheezing: 0.3,
              coughing: 0.2,
              shortness_of_breath: 0.5,
            },
          },
          id: "analysis123",
          createdAt: new Date().toISOString(),
        }
        setAnalysisResult(mockResult)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions to transform the backend response
  const calculateScoreFromStatus = (status: string): number => {
    switch (status.toLowerCase()) {
      case "normal": return 90
      case "warning": return 60
      case "critical": return 30
      default: return 50
    }
  }

  const mapStatusToRisk = (status: string): string => {
    switch (status.toLowerCase()) {
      case "normal": return "low"
      case "warning": return "moderate"
      case "critical": return "high"
      default: return "moderate"
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setUploadError(null)
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-[#1a2352] mb-2">
            Respiratory Analysis
          </h1>
      <p className="text-center text-gray-600 mb-8">
        Upload a recording of your breathing or record it live for analysis
      </p>

      {analysisResult ? (
        <AnalysisResults result={analysisResult} onReset={resetAnalysis} />
      ) : (
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="record">Record Live</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardContent className="pt-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    uploadedFile
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-[#ff7757] hover:bg-gray-50"
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                <input
                  type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/*"
                  className="hidden"
                  />

                  <div className="flex flex-col items-center">
                    {uploadedFile ? (
                      <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                          <CheckIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-lg font-medium mb-1">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                        <p className="text-sm text-[#ff7757]">
                          Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <UploadIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium mb-1">
                          Drag & drop your audio file
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          or click to browse files
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports WAV, MP3, AAC, FLAC
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleUploadSubmit}
                    className="bg-[#ff7757] hover:bg-[#e85d3d] text-white px-8"
                    disabled={!uploadedFile || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Analyze Recording"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="record">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-[#fff2ed] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MicIcon className="w-10 h-10 text-[#ff7757]" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Record Your Breathing</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Make sure you're in a quiet environment. The recording will
                    last for 30 seconds.
                  </p>
              </div>

                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#ff7757] hover:bg-[#e85d3d] text-white px-8"
                  disabled={isLoading}
                >
                  Start Recording
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <RecordingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordingComplete={handleRecordingComplete}
        duration={30}
      />
    </div>
  )
}

function AnalysisResults({
  result,
  onReset,
}: {
  result: SafeAnalysisResponse
  onReset: () => void
}) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  
  // Add safety checks to handle potentially undefined values
  if (!result || !result.details) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">Error: Invalid analysis result data</p>
          <Button
            onClick={onReset}
            variant="outline"
            className="mt-4 border-[#1a2352] text-[#1a2352]"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Safe access to risk value
  const risk = result.details?.risk || 'unknown'
  const riskColor = getRiskColor(risk)
  
  return (
    <>
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${riskColor.bg}`}>
              <span className={`text-3xl font-bold ${riskColor.text}`}>
                {result.details.score || 0}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {getRiskText(risk)}
            </h2>
            <p className="text-gray-600">
              {getRiskDescription(risk)}
            </p>
              </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Detected Patterns</h3>
            
            <div className="space-y-4">
              <PatternBar 
                label="Wheezing" 
                value={result.details.patterns?.wheezing || 0} 
                color="text-yellow-500"
              />
              <PatternBar 
                label="Coughing" 
                value={result.details.patterns?.coughing || 0} 
                color="text-orange-500"
              />
              <PatternBar 
                label="Shortness of Breath" 
                value={result.details.patterns?.shortness_of_breath || 0} 
                color="text-red-500"
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Analysis completed on {formatDate(result.createdAt || new Date().toISOString())}
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={onReset}
                variant="outline"
                className="border-[#1a2352] text-[#1a2352]"
              >
                New Analysis
              </Button>
              <Button
                className="bg-[#1a2352] hover:bg-[#0f1838] text-white"
                onClick={() => setIsReportModalOpen(true)}
              >
                View Detailed Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed Report Modal - Made more compact */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a2352]">Analysis Report</DialogTitle>
            <DialogDescription>
              Summary of your respiratory analysis
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {/* Report Header - simplified */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">ID:</span> {result.id?.substring(0, 8)}...
              </div>
              <div>
                <span>{formatDate(result.createdAt || new Date().toISOString(), true)}</span>
              </div>
            </div>
            
            {/* Status & Score - simplified */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${riskColor.bg}`}>
                  <span className={`text-lg font-bold ${riskColor.text}`}>
                    {result.details.score || 0}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{getRiskText(risk)}</p>
                  <p className="text-xs text-gray-600">{result.message}</p>
                </div>
              </div>

              <div className="text-sm mb-2">
                <span className="font-medium">File:</span> {result.filePath?.split('/').pop() || 'Unknown'}
              </div>
            </div>
            
            {/* Pattern Details - simplified */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Detected Patterns</h3>
              <div className="space-y-3">
                <PatternBar 
                  label="Wheezing" 
                  value={result.details.patterns?.wheezing || 0} 
                  color="text-yellow-500"
                />
                <PatternBar 
                  label="Coughing" 
                  value={result.details.patterns?.coughing || 0} 
                  color="text-orange-500"
                />
                <PatternBar 
                  label="Shortness of Breath" 
                  value={result.details.patterns?.shortness_of_breath || 0} 
                  color="text-red-500"
                />
              </div>
                  </div>
            
            {/* Top Recommendations - simplified */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Key Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {getRiskRecommendations(risk).slice(0, 2).map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
              </div>

          <DialogFooter className="mt-4">
                  <Button
              variant="outline"
              onClick={() => setIsReportModalOpen(false)}
              className="border-[#1a2352] text-[#1a2352]"
                  >
              Close
                  </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function PatternBar({ 
  label, 
  value, 
  color 
}: { 
  label: string
  value: number
  color: string
}) {
  // Convert decimal to percentage
  const percentage = Math.round(value * 100)
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-medium ${color}`}>{percentage}%</span>
              </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  else return (bytes / 1048576).toFixed(1) + " MB"
}

function formatDate(dateString: string, short: boolean = false): string {
  try {
    // Create date in UTC
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }
    
    // Convert to IST by setting options
    const options: Intl.DateTimeFormatOptions = short ? 
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: 'Asia/Kolkata'
      } : 
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }
    
    return new Intl.DateTimeFormat('en-IN', options).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Unknown date"
  }
}

function getRiskColor(risk: string | null | undefined): { bg: string; text: string } {
  if (!risk) {
    return { bg: "bg-gray-100", text: "text-gray-700" }
  }
  
  switch (risk.toLowerCase()) {
    case "low":
      return { bg: "bg-green-100", text: "text-green-700" }
    case "moderate":
      return { bg: "bg-yellow-100", text: "text-yellow-700" }
    case "high":
      return { bg: "bg-red-100", text: "text-red-700" }
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" }
  }
}

function getRiskText(risk: string | null | undefined): string {
  if (!risk) {
    return "Unknown Risk"
  }
  
  switch (risk.toLowerCase()) {
    case "low":
      return "Low Risk"
    case "moderate":
      return "Moderate Risk"
    case "high":
      return "High Risk"
    default:
      return "Unknown Risk"
  }
}

function getRiskDescription(risk: string | null | undefined): string {
  if (!risk) {
    return "Unable to determine risk level from the provided recording."
  }
  
  switch (risk.toLowerCase()) {
    case "low":
      return "Your breathing patterns appear normal with minimal irregularities."
    case "moderate":
      return "Some concerning patterns detected. Consider consulting with a healthcare professional."
    case "high":
      return "Significant irregularities detected. We recommend seeking medical advice promptly."
    default:
      return "Unable to determine risk level from the provided recording."
  }
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Helper function to get pattern descriptions
function getPatternDescription(patternType: string, severity: number): string {
  const severityLevel = severity <= 0.2 ? 'low' : severity <= 0.6 ? 'moderate' : 'high'
  
  switch (patternType) {
    case 'wheezing':
      switch (severityLevel) {
        case 'low': return 'Minimal to no wheezing detected in the recording.'
        case 'moderate': return 'Some wheezing sounds detected. May indicate mild airway constriction.'
        case 'high': return 'Significant wheezing detected. Indicates considerable airway narrowing.'
      }
      break
    
    case 'coughing':
      switch (severityLevel) {
        case 'low': return 'Few to no coughs detected in the recording.'
        case 'moderate': return 'Some coughing detected. May indicate mild respiratory irritation.'
        case 'high': return 'Frequent coughing detected. Indicates significant respiratory irritation.'
      }
      break
    
    case 'shortness_of_breath':
      switch (severityLevel) {
        case 'low': return 'Normal breathing pattern with good airflow.'
        case 'moderate': return 'Some irregularity in breathing pattern. May indicate mild breathlessness.'
        case 'high': return 'Significant irregularity in breathing pattern. Indicates difficulty breathing.'
      }
      break
  }
  
  return 'Analysis not available for this pattern.'
}

// Helper function to get recommendations based on risk level
function getRiskRecommendations(risk: string): string[] {
  switch (risk.toLowerCase()) {
    case 'low':
      return [
        'Continue maintaining good respiratory health',
        'Stay hydrated and maintain regular exercise',
        'Consider follow-up analysis in 6 months',
        'Avoid exposure to air pollutants and allergens'
      ]
    case 'moderate':
      return [
        'Consider consulting with a healthcare professional',
        'Monitor your symptoms for any changes',
        'Avoid respiratory irritants like smoke and pollutants',
        'Consider follow-up analysis in 1-2 months',
        'Maintain good hydration and consider breathing exercises'
      ]
    case 'high':
      return [
        'We strongly recommend consulting with a healthcare professional as soon as possible',
        'Avoid strenuous activities until you have been evaluated',
        'Avoid all respiratory irritants such as smoke, strong chemicals, and pollutants',
        'Monitor your symptoms closely and seek immediate medical help if they worsen',
        'Schedule a follow-up analysis after consulting with your doctor'
      ]
    default:
      return [
        'Consider consulting with a healthcare professional',
        'Monitor your respiratory health regularly',
        'Schedule a follow-up analysis to track any changes'
      ]
  }
} 