"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Upload, Send, StopCircle, Bot, Volume2, VolumeX } from "lucide-react"
import ReactMarkdown from "react-markdown"

// Define message interface
interface Message {
  text: string
  isUser: boolean
  isLoading?: boolean
  fileInfo?: {
    name: string
    type: string
    content?: string
  }
}

// Add markdown styles
const markdownStyles = {
  p: "mb-4",
  h2: "text-xl font-bold mb-2 mt-4 text-indigo-300",
  h3: "text-lg font-bold mb-2 mt-3 text-indigo-200",
  ul: "list-disc pl-5 mb-4 space-y-1",
  ol: "list-decimal pl-5 mb-4 space-y-1",
  li: "mb-1",
  blockquote: "border-l-4 border-indigo-400 pl-4 italic my-4 text-gray-300",
  strong: "font-bold text-indigo-100",
  em: "italic text-gray-200",
  hr: "my-4 border-gray-600",
}

// Expanded health topics for better detection
const healthTopics = [
  // General health terms
  "health", "wellness", "fitness", "nutrition", "diet", "hydration", "mental health",
  "sleep", "exercise", "stress", "meditation", "yoga", "weight", "self-care", 
  
  // Diseases and conditions
  "cancer", "caner", "tumor", "heart disease", "diabetes", "hypertension", "high blood pressure",
  "stroke", "arthritis", "flu", "virus", "bacteria", "covid", "hiv", "aids", "tuberculosis",
  "hepatitis", "pneumonia", "asthma", "allergy", "cholesterol", "obesity", "malaria",
  "alzheimer", "parkinson", "dementia", "epilepsy", "migraine", "headache",
  
  // Mental health conditions
  "depression", "anxiety", "bipolar", "schizophrenia", "ptsd", "adhd", "ocd",
  "eating disorder", "autism", "insomnia", "trauma", "addiction", "alcoholism",
  
  // Symptoms
  "fever", "cough", "cold", "sore throat", "fatigue", "nausea", "vomiting", "diarrhea",
  "pain", "rash", "swelling", "blood pressure", "heartburn", "dizziness", "fainting",
  
  // Medical terms
  "medication", "medicine", "drug", "pill", "tablet", "vaccine", "surgery", "therapy",
  "hospital", "clinic", "doctor", "nurse", "physician", "medical", "emergency", "treatment",
  "diagnosis", "symptom", "prescription", "checkup", "examination",
  
  // Organizations
  "who", "world health organization", "cdc", "fda", "nih", "red cross",
  
  // Body parts
  "heart", "lung", "brain", "liver", "kidney", "stomach", "intestine", "muscle", "bone",
  "joint", "spine", "skin", "blood", "artery", "vein",
  
  // Nutrition
  "vitamin", "mineral", "protein", "carbohydrate", "fat", "sugar", "calorie", "supplement",
  
  // Lifestyle
  "smoking", "alcohol", "drug use", "exercise", "diet", "nutrition"
]

// For Vite, we need to access environment variables with import.meta.env
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceInputUsed, setVoiceInputUsed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [voiceAnimationFrames, setVoiceAnimationFrames] = useState<number[]>([])
  const transcriptRef = useRef<string>("")

  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([
    {
      role: "system",
      content: `You are a friendly and helpful health assistant named HealthBot that provides complete, thorough answers to health-related questions. You should also respond naturally to general conversational questions.

Important guidelines:
1. Always provide complete answers - never cut off mid-explanation
2. If a query is vague or general (like just "medicines" or "treatment"), ask for clarification
3. Structure longer responses with clear sections and bullet points when appropriate
4. Include practical, actionable advice when possible
5. If you don't know something, clearly state that rather than providing uncertain information
6. For general conversational questions that are health-related, respond naturally and briefly
7. When analyzing uploaded files, provide a thorough analysis of the health-related content
8. If a query contains the acronym of a health organization (like WHO, CDC), understand it's health-related
9. Understand that users may misspell terms (like "caner" instead of "cancer") - try to recognize health intent
10. Remember that questions about health organizations (WHO, CDC, etc.) are health-related questions

Formatting guidelines:
1. Use **bold text** for section headings and important information
2. Use *italics* for emphasis on key points
3. Use proper spacing between paragraphs for readability
4. Use bullet points (*, -) or numbered lists (1., 2.) for listing items
5. Use ### for main headings and ## for subheadings
6. Use > for important notes or warnings
7. Always format your responses with proper Markdown to enhance readability`,
    },
  ])

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize speech recognition
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        // Create a new instance each time to avoid issues
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          try {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0])
              .map((result: any) => result.transcript)
              .join(" ")

            console.log("Transcript:", transcript)

            // Store the transcript in the ref to access it in onend
            transcriptRef.current = transcript

            // Update the input field for visual feedback
            setInput(transcript)

            // Generate random animation frames for voice visualization
            const frames = Array.from({ length: 20 }, () => Math.floor(Math.random() * 50) + 10)
            setVoiceAnimationFrames(frames)
          } catch (err) {
            console.error("Error processing speech result:", err)
          }
        }

        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended, isRecording:", isRecording)
          if (isRecording) {
            setIsProcessingVoice(true)

            // Use the stored transcript from the ref
            const finalTranscript = transcriptRef.current
            console.log("Final transcript:", finalTranscript)

            setTimeout(() => {
              setIsRecording(false)
              setIsProcessingVoice(false)

              if (finalTranscript && finalTranscript.trim()) {
                setInput(finalTranscript)
                setVoiceInputUsed(true)
                handleSendWithVoice(finalTranscript)
              }
            }, 1000)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsRecording(false)
          setIsProcessingVoice(false)

          if (event.error === "not-allowed") {
            alert("Microphone access was denied. Please allow microphone access to use voice input.")
          }
        }
      }

      // Initialize speech synthesis
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis

        // Load voices
        if (synthRef.current.onvoiceschanged !== undefined) {
          synthRef.current.onvoiceschanged = loadVoices
        }

        loadVoices()
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (err) {
          console.error("Error aborting speech recognition:", err)
        }
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Load available voices
  const loadVoices = () => {
    if (synthRef.current) {
      synthRef.current.getVoices()
    }
  }

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Improved health-related check function
  const isHealthRelated = (message: string): boolean => {
    if (!message) return false
    
    // Convert to lowercase for case-insensitive comparison
    const lowerCaseMessage = message.toLowerCase()
    
    // Check for exact health organizations
    if (lowerCaseMessage === "who" || lowerCaseMessage === "what is who") {
      return true
    }
    
    // Split message into words to check for individual health terms
    const words = lowerCaseMessage.split(/\s+/)
    
    // Check if any word is a health-related term with high confidence
    for (const word of words) {
      if (word.length > 2 && healthTopics.includes(word)) {
        return true
      }
    }
    
    // Check if any phrase in the health topics is in the message
    return healthTopics.some(topic => {
      // For topics with multiple words, ensure it's contained in the message
      if (topic.includes(" ")) {
        return lowerCaseMessage.includes(topic)
      }
      
      // For single word topics that are short, be more careful about partial matches
      // e.g., "diet" should match "diet" but not "audited"
      if (topic.length <= 3) {
        return words.includes(topic)
      }
      
      // For longer single words, allow for typos by checking if the topic is contained
      // within the message with some flexibility
      return lowerCaseMessage.includes(topic)
    })
  }

  // Extract text from file
  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string
          resolve(text)
        } catch (error) {
          reject(`Failed to extract text from file: ${error}`)
        }
      }
      reader.onerror = (error) => reject(`Error reading file: ${error}`)
      reader.readAsText(file)
    })
  }

  // Fetch AI response
  const fetchAIResponse = async (userMessage: string, fileInfo?: { name: string; type: string; content?: string }) => {
    try {
      // Check if API key is available
      if (!API_KEY) {
        console.error("API Key is not defined. Please check your environment variables.");
        return "Sorry, there was an error connecting to the AI service. Please check the API configuration.";
      }
      
      const API_URL = "https://api.groq.com/openai/v1/chat/completions"

      // Prepare message content
      let messageContent = userMessage
      let fileContent = ""

      if (fileInfo && fileInfo.content) {
        fileContent = fileInfo.content
        messageContent = `I've uploaded a file named "${fileInfo.name}" (${fileInfo.type}). Here's the content:\n\n${fileContent}\n\nPlease analyze this document and provide insights.`
      }

      // Prepare messages for the API
      const messages = [
        {
          role: "system",
          content: `You are a friendly and helpful health assistant named HealthBot that provides complete, thorough answers to health-related questions. You should also respond naturally to general conversational questions.

Important guidelines:
1. Always provide complete answers - never cut off mid-explanation
2. If a query is vague or general (like just "medicines" or "treatment"), ask for clarification
3. Structure longer responses with clear sections and bullet points when appropriate
4. Include practical, actionable advice when possible
5. If you don't know something, clearly state that rather than providing uncertain information
6. For general conversational questions that are health-related, respond naturally and briefly
7. When analyzing uploaded files, provide a thorough analysis of the health-related content
8. If a query contains the acronym of a health organization (like WHO, CDC), understand it's health-related
9. Understand that users may misspell terms (like "caner" instead of "cancer") - try to recognize health intent
10. Remember that questions about health organizations (WHO, CDC, etc.) are health-related questions
11. IMPORTANT: If the content is not health-related, politely explain that you're a health assistant and can only help with health topics
12. Use Markdown formatting in your responses

Formatting guidelines:
1. Use **bold text** for section headings and important information
2. Use *italics* for emphasis on key points
3. Use proper spacing between paragraphs for readability
4. Use bullet points (*, -) or numbered lists (1., 2.) for listing items
5. Use ## for main headings and ### for subheadings
6. Use > for important notes or warnings`,
        },
        {
          role: "user",
          content: messageContent,
        },
      ]

      // Make the API request
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const assistantResponse = data.choices[0].message.content

      // Add assistant response to conversation history
      setConversationHistory((prev) => [...prev, { role: "assistant", content: assistantResponse }])

      return assistantResponse
    } catch (error) {
      console.error("Error:", error)
      return "There was an error processing your request. Please try again later."
    }
  }

  // Speak text using speech synthesis
  const speakText = (text: string) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      if (synthRef.current.speaking) {
        synthRef.current.cancel()
      }

      // Remove markdown formatting for better speech
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s?(.*?)\n/g, "$1. ")
        .replace(/\[(.*?)\]$$(.*?)$$/g, "$1")
        .replace(/\n/g, ". ")
        .replace(/\s+/g, " ")
        .replace(/>/g, "")
        .replace(/\*/g, "")
        .replace(/-/g, "")
        .replace(/\d+\./g, "")
        .replace(/👋/g, "")

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Use a female voice if available
      const voices = synthRef.current.getVoices()
      const femaleVoice = voices.find((voice) => voice.name.includes("female") || voice.name.includes("Female"))
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      synthRef.current.speak(utterance)
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  // Simulate AI response
  const simulateResponse = async (userMessage: string, fileInfo?: { name: string; type: string; content?: string }) => {
    // Add user message to conversation history
    setConversationHistory((prev) => [...prev, { role: "user", content: userMessage }])

    // Add placeholder for loading
    const newMessage: Message = {
      text: "",
      isUser: false,
      isLoading: true,
    }
    setMessages((prevMessages) => [...prevMessages, newMessage])

    // Fetch AI response
    const aiResponse = await fetchAIResponse(userMessage, fileInfo)

    // Update message with AI response
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages]
      const loadingMessageIndex = updatedMessages.findIndex((msg) => msg.isLoading)
      if (loadingMessageIndex !== -1) {
        updatedMessages[loadingMessageIndex] = {
          text: aiResponse,
          isUser: false,
          isLoading: false,
        }
      }
      return updatedMessages
    })

    // Auto-speak if voice was used for input
    if (voiceInputUsed) {
      setVoiceInputUsed(false)
      speakText(aiResponse)
    }

    return aiResponse
  }

  // Handle voice input
  const toggleVoiceRecording = () => {
    if (!isRecording) {
      startVoiceRecording()
    } else {
      stopVoiceRecording()
    }
  }

  const startVoiceRecording = () => {
    setIsRecording(true)
    transcriptRef.current = ""

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        console.log("Voice recording started")
      } catch (err) {
        console.error("Error starting speech recognition:", err)
        setIsRecording(false)
      }
    } else {
      console.error("Speech recognition not available")
      setIsRecording(false)
    }
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        console.log("Voice recording stopped")
      } catch (err) {
        console.error("Error stopping speech recognition:", err)
      }
      setIsRecording(false)
    }
  }

  // Handle sending message with voice
  const handleSendWithVoice = (voiceText: string) => {
    if (voiceText.trim()) {
      // Add user message
      const newUserMessage: Message = {
        text: voiceText,
        isUser: true,
      }
      setMessages((prevMessages) => [...prevMessages, newUserMessage])

      // Get AI response
      simulateResponse(voiceText)

      // Clear input field
      setInput("")
      setVoiceInputUsed(true)
    }
  }

  // Handle file upload button click
  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle file change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    try {
      // Check file type
      if (file.type !== "text/plain") {
        throw new Error("Only text files are supported for now.")
      }

      // Extract text from file
      const content = await extractTextFromFile(file)

      // Add file upload message
      const fileUploadMessage: Message = {
        text: `I've uploaded a file: ${file.name}`,
        isUser: true,
        fileInfo: {
          name: file.name,
          type: file.type,
          content,
        },
      }
      setMessages((prevMessages) => [...prevMessages, fileUploadMessage])

      // Get AI response with file content
      simulateResponse(`Analyze this file: ${file.name}`, {
        name: file.name,
        type: file.type,
        content,
      })
    } catch (error: any) {
      console.error("File upload error:", error)
      // Add error message
      const errorMessage: Message = {
        text: error.message || "There was an error processing your file.",
        isUser: false,
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Handle send button click
  const handleSend = () => {
    if (input.trim()) {
      const userMessage = input.trim()

      // Add user message
      const newUserMessage: Message = {
        text: userMessage,
        isUser: true,
      }
      setMessages((prevMessages) => [...prevMessages, newUserMessage])

      // Get AI response - let the AI handle the health check
      simulateResponse(userMessage)

      // Clear input field
      setInput("")
    }
  }

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  // Handle keyboard enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-gradient-to-br from-indigo-950 to-slate-900 rounded-xl border border-indigo-900 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 bg-indigo-900/50 border-b border-indigo-800">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full mr-3">
          <Bot size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-semibold text-white">HealthBot</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <Bot size={48} className="text-indigo-400" />
            <h2 className="text-xl font-semibold text-indigo-200">Welcome to HealthBot</h2>
            <p className="text-gray-400 max-w-md">
              Ask me any health-related questions, and I'll provide you with helpful information and guidance.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.isUser ? "flex justify-end" : "flex justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isUser
                    ? "bg-indigo-700 text-white rounded-tr-none"
                    : "bg-gray-800 text-gray-200 rounded-tl-none"
                }`}
              >
                {message.isLoading ? (
                  <div className="flex space-x-2 justify-center items-center h-6">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : message.isUser ? (
                  <div>{message.text}</div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className={markdownStyles.p} {...props} />,
                        h2: ({ node, ...props }) => <h2 className={markdownStyles.h2} {...props} />,
                        h3: ({ node, ...props }) => <h3 className={markdownStyles.h3} {...props} />,
                        ul: ({ node, ...props }) => <ul className={markdownStyles.ul} {...props} />,
                        ol: ({ node, ...props }) => <ol className={markdownStyles.ol} {...props} />,
                        li: ({ node, ...props }) => <li className={markdownStyles.li} {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className={markdownStyles.blockquote} {...props} />,
                        strong: ({ node, ...props }) => <strong className={markdownStyles.strong} {...props} />,
                        em: ({ node, ...props }) => <em className={markdownStyles.em} {...props} />,
                        hr: ({ node, ...props }) => <hr className={markdownStyles.hr} {...props} />,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                    <div className="flex justify-end mt-2">
                      {isSpeaking ? (
                        <button
                          onClick={stopSpeaking}
                          className="text-indigo-400 hover:text-indigo-300 transition"
                          title="Stop Speaking"
                        >
                          <VolumeX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => speakText(message.text)}
                          className="text-indigo-400 hover:text-indigo-300 transition"
                          title="Read Aloud"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-indigo-900">
        <div className="flex space-x-2">
          <button
            onClick={handleFileUploadClick}
            className="p-2 rounded-full hover:bg-indigo-800 text-indigo-400 transition"
            title="Upload File"
          >
            <Upload size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt"
          />
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your health question..."
              className="w-full p-3 pr-10 bg-gray-800 rounded-lg border border-gray-700 text-gray-200 placeholder-gray-500"
              disabled={isRecording || isProcessingVoice}
            />
            
            {isRecording && (
              <div className="absolute right-12 inset-y-0 flex items-center pr-2 space-x-1">
                {voiceAnimationFrames.map((height, i) => (
                  <div
                    key={i}
                    className="h-full w-[3px] bg-red-500"
                    style={{
                      height: `${height}%`,
                      transition: "height 150ms ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={toggleVoiceRecording}
            className={`p-2 rounded-full transition ${
              isRecording
                ? "bg-red-700 hover:bg-red-800 text-white"
                : "hover:bg-indigo-800 text-indigo-400"
            }`}
            title={isRecording ? "Stop Recording" : "Voice Input"}
          >
            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition"
            disabled={isRecording || isProcessingVoice || !input.trim()}
            title="Send Message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbot