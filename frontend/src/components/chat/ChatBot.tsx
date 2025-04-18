import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Send, Bot, X, MessageSquare, Heart, Shield, Stethoscope, Thermometer, Brain } from "lucide-react"
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  role: "user" | "assistant"
  content: string
}

const healthTopics = [
  { icon: <Heart className="w-5 h-5" />, title: "Heart Health" },
  { icon: <Shield className="w-5 h-5" />, title: "Prevention" },
  { icon: <Stethoscope className="w-5 h-5" />, title: "Symptoms" },
  { icon: <Thermometer className="w-5 h-5" />, title: "Treatment" },
]

// Enhanced mock responses
const mockResponses: Record<string, string> = {
  "Heart Health": "Maintaining good heart health is crucial for respiratory function. Here are key points:\n\n1. Regular cardiovascular exercise (30 minutes daily)\n2. Balanced diet rich in fruits, vegetables, and omega-3s\n3. Avoid smoking and secondhand smoke\n4. Monitor blood pressure and cholesterol\n5. Get regular check-ups\n6. Manage stress through relaxation techniques\n\nRemember to consult your doctor for personalized advice.",
  
  "Prevention": "To prevent respiratory issues, follow these guidelines:\n\n1. Avoid smoking and secondhand smoke\n2. Regular exercise (especially aerobic activities)\n3. Maintain a healthy weight\n4. Get vaccinated (flu and pneumonia vaccines)\n5. Practice good hygiene (hand washing, mask-wearing)\n6. Avoid air pollution and allergens\n7. Use air purifiers at home\n8. Stay hydrated\n9. Get adequate sleep\n10. Regular medical check-ups",
  
  "Symptoms": "Common respiratory symptoms to watch for:\n\n1. Shortness of breath (dyspnea)\n2. Persistent cough (lasting more than 3 weeks)\n3. Wheezing or whistling sound when breathing\n4. Chest tightness or pain\n5. Excessive mucus production\n6. Frequent respiratory infections\n7. Fatigue during normal activities\n8. Bluish tint to lips or fingernails\n\nIf you experience any of these symptoms, please consult a healthcare professional immediately.",
  
  "Treatment": "Respiratory health treatments may include:\n\n1. Medications:\n   - Bronchodilators\n   - Corticosteroids\n   - Antibiotics (for infections)\n   - Mucolytics\n\n2. Therapies:\n   - Oxygen therapy\n   - Pulmonary rehabilitation\n   - Breathing exercises\n   - Chest physiotherapy\n\n3. Lifestyle Changes:\n   - Smoking cessation\n   - Regular exercise\n   - Healthy diet\n   - Stress management\n\n4. Surgical Options (in severe cases):\n   - Lung volume reduction\n   - Lung transplant\n   - Bullectomy\n\nAlways follow your doctor's recommendations and treatment plan."
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)
    setError(null)

    try {
      // Debug: Check if API key is available
      console.log("API Key available:", !!import.meta.env.VITE_GEMINI_API_KEY)
      
      // Check if it's a topic-based question
      const topicMatch = userMessage.toLowerCase().match(/tell me about (.*) in respiratory health/i)
      if (topicMatch) {
        const topic = topicMatch[1].charAt(0).toUpperCase() + topicMatch[1].slice(1)
        if (mockResponses[topic]) {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: mockResponses[topic] 
          }])
          return
        }
      }

      // Use Gemini API if available
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        try {
          console.log("Initializing Gemini API...")
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
          
          // Configure safety settings
          const safetySettings = [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ]

          console.log("Getting model...")
          const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            safetySettings,
          })
          
          const prompt = `
            You are a professional medical assistant specializing in respiratory health. 
            Please provide accurate, helpful, and professional advice about: ${userMessage}
            
            Guidelines for your response:
            1. Focus only on respiratory health-related topics
            2. If the question is not health-related, politely redirect to health topics
            3. Keep responses concise and clear
            4. Include relevant precautions and prevention tips
            5. Always recommend consulting a doctor for serious concerns
            6. Use simple language that's easy to understand
            7. Include relevant statistics or facts when appropriate
            8. Format your response with clear sections and bullet points when appropriate
          `

          console.log("Generating content...")
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          })
          console.log("Response received:", result)
          
          const response = await result.response
          console.log("Response text:", response.text())
          
          const text = response.text()

          if (!text) {
            throw new Error("No response received from the API")
          }

          setMessages(prev => [...prev, { role: "assistant", content: text }])
        } catch (apiError) {
          console.error("Gemini API Error:", apiError)
          throw apiError
        }
      } else {
        console.log("No API key found, using mock response")
        // Fallback to mock response if no API key
        const fallbackResponse = mockResponses["Treatment"] || "I'm here to help with respiratory health. Please try asking about specific topics like treatment, prevention, symptoms, or heart health."
        setMessages(prev => [...prev, { role: "assistant", content: fallbackResponse }])
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Sorry, I'm having trouble processing your request. Please try again later.")
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble processing your request right now. Please try again later or consult a healthcare professional for immediate assistance." 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTopicClick = (topic: string) => {
    setInput(`Tell me about ${topic.toLowerCase()} in respiratory health`)
    handleSendMessage()
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          duration: 0.5
        }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
        >
          <motion.div
            animate={{ 
              rotate: isOpen ? 180 : 0,
              scale: isOpen ? 0.8 : 1
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Brain className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </motion.div>
          <motion.div
            animate={{ 
              opacity: isOpen ? 0 : 1,
              scale: isOpen ? 0 : 1
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff7757] to-[#ff5757] rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          </motion.div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className={`fixed ${isMinimized ? 'bottom-24 right-6 w-96 h-32' : 'bottom-24 right-6 w-96 h-[600px]'} bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden`}
          >
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-[#ff7757] to-[#ff5757] text-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                <h3 className="font-semibold">Health Assistant</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/10 text-white"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/10 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center text-gray-500 mt-8"
                    >
                      <p className="text-lg font-medium mb-4">How can I help you today?</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {healthTopics.map((topic, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTopicClick(topic.title)}
                            className="flex flex-col items-center p-4 rounded-lg border hover:border-[#ff7757] transition-colors"
                          >
                            {topic.icon}
                            <span className="mt-2 text-sm font-medium">{topic.title}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-[#ff7757] text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about respiratory health..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="bg-[#ff7757] hover:bg-[#ff5757]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 