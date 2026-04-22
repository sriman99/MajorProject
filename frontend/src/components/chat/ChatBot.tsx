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

// Smart fallback response based on user message keywords
const getSmartFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase()

  // Check for specific keywords and return relevant response
  if (lowerMessage.includes('cough') || lowerMessage.includes('coughing')) {
    return "Coughing can be caused by various factors:\n\n**Common Causes:**\n• Viral infections (cold, flu)\n• Allergies\n• Asthma\n• Acid reflux\n• Environmental irritants\n\n**When to See a Doctor:**\n• Cough lasting more than 3 weeks\n• Coughing up blood\n• Difficulty breathing\n• High fever\n\n**Home Remedies:**\n• Stay hydrated\n• Use honey (for adults)\n• Humidify the air\n• Avoid irritants\n\nPlease consult a healthcare professional for persistent symptoms."
  }

  if (lowerMessage.includes('breath') || lowerMessage.includes('breathing') || lowerMessage.includes('shortness')) {
    return "Shortness of breath (dyspnea) can be concerning:\n\n**Common Causes:**\n• Asthma\n• COPD\n• Pneumonia\n• Anxiety\n• Heart conditions\n• Anemia\n\n**Warning Signs (Seek Immediate Help):**\n• Sudden severe breathlessness\n• Chest pain\n• Blue lips or fingers\n• Confusion\n\n**Management Tips:**\n• Practice pursed-lip breathing\n• Stay calm and relaxed\n• Sit upright\n• Use prescribed inhalers\n\nIf symptoms are severe or sudden, seek emergency care immediately."
  }

  if (lowerMessage.includes('asthma')) {
    return "Asthma is a chronic respiratory condition:\n\n**Symptoms:**\n• Wheezing\n• Shortness of breath\n• Chest tightness\n• Coughing (especially at night)\n\n**Triggers to Avoid:**\n• Allergens (dust, pollen, pet dander)\n• Smoke\n• Cold air\n• Exercise (for some)\n• Stress\n\n**Management:**\n• Use controller medications as prescribed\n• Keep rescue inhaler handy\n• Monitor peak flow\n• Create an action plan with your doctor\n\nRegular check-ups are essential for proper management."
  }

  if (lowerMessage.includes('pneumonia')) {
    return "Pneumonia is a serious lung infection:\n\n**Symptoms:**\n• High fever\n• Productive cough\n• Chest pain when breathing\n• Fatigue\n• Shortness of breath\n\n**Risk Factors:**\n• Age (very young or elderly)\n• Weakened immune system\n• Chronic diseases\n• Smoking\n\n**Prevention:**\n• Get vaccinated (pneumococcal, flu)\n• Practice good hygiene\n• Don't smoke\n• Maintain good health\n\nPneumonia requires medical treatment. Please see a doctor if you suspect you have it."
  }

  if (lowerMessage.includes('wheez') || lowerMessage.includes('whistl')) {
    return "Wheezing is a whistling sound when breathing:\n\n**Common Causes:**\n• Asthma\n• Allergies\n• Bronchitis\n• COPD\n• Respiratory infections\n\n**When to Seek Help:**\n• First-time wheezing\n• Accompanied by difficulty breathing\n• Bluish skin color\n• Chest pain\n\n**Immediate Relief:**\n• Sit upright\n• Stay calm\n• Use prescribed bronchodilator\n• Breathe slowly\n\nConsult a doctor to determine the underlying cause."
  }

  // Default response for general health questions
  return "Thank you for your health question. Here's some general respiratory health advice:\n\n**Key Tips for Healthy Lungs:**\n1. Don't smoke and avoid secondhand smoke\n2. Exercise regularly\n3. Maintain good indoor air quality\n4. Practice good hygiene\n5. Get vaccinated\n6. Practice breathing exercises\n\n**When to See a Doctor:**\n• Persistent cough (>3 weeks)\n• Difficulty breathing\n• Chest pain\n• Coughing up blood\n• Unexplained weight loss\n\nFor specific medical advice, please consult a healthcare professional. You can also book an appointment with our specialist doctors through the Appointments page."
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
            model: "gemini-2.0-flash",
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
        } catch (apiError: any) {
          console.error("Gemini API Error:", apiError)
          // Check if it's a rate limit error (429)
          if (apiError?.message?.includes('429') || apiError?.message?.includes('quota') || apiError?.message?.includes('RATE_LIMIT')) {
            console.log("Rate limit hit, using smart fallback response")
            // Use intelligent fallback based on user message
            const fallbackResponse = getSmartFallbackResponse(userMessage)
            setMessages(prev => [...prev, { role: "assistant", content: fallbackResponse }])
          } else {
            throw apiError
          }
        }
      } else {
        console.log("No API key found, using mock response")
        // Fallback to mock response if no API key
        const fallbackResponse = getSmartFallbackResponse(userMessage)
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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#ff7757] to-[#ff5757] hover:opacity-90 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
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
            className={`fixed ${isMinimized ? 'bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-32' : 'bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-6rem)] sm:h-[600px]'} bg-white rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden`}
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