"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Send,
  Database,
  Stethoscope,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Brain,
} from "lucide-react"

export default function VirtualDoctor() {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [retrievedChunks, setRetrievedChunks] = useState<string[]>([])
  const [showChunks, setShowChunks] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("query")
  const responseRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setIsLoading(true)
    setError("")
    setRetrievedChunks([])
    setShowChunks(false)
    setActiveTab("response")

    try {
      const res = await fetch("/api/medical-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

      const data = await res.json()
      setResponse(data.response)
      setRetrievedChunks(data.retrievedChunks || [])
    } catch (err) {
      setError("Sorry, there was an error processing your request. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [response])

  const pulseVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  }

  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-blue-50">
              <TabsTrigger value="query" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask a Question
              </TabsTrigger>
              <TabsTrigger value="response" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                View Response
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="query" className="mt-0">
            <motion.div variants={pulseVariants} initial="initial" animate="animate" exit="exit">
              <Card className="bg-white shadow-lg border-blue-100 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    >
                      <Stethoscope className="h-6 w-6 text-blue-600 mr-2" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-800">Medical Consultation</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                        What would you like to ask our virtual doctor?
                      </label>
                      <Textarea
                        id="query"
                        placeholder="Describe your symptoms or ask a health question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="min-h-[150px] resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 px-6 py-2 rounded-md"
                      >
                        {isLoading ? (
                          <motion.div
                            className="flex items-center"
                            animate={{ opacity: [0.6, 1] }}
                            transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                          >
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </motion.div>
                        ) : (
                          <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </motion.div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="response" className="mt-0">
            <div ref={responseRef}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        times: [0, 0.5, 1],
                      }}
                      className="mb-4"
                    >
                      <Brain className="h-16 w-16 text-blue-500" />
                    </motion.div>
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      className="text-lg font-medium text-gray-700"
                    >
                      Analyzing medical data...
                    </motion.p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-md shadow-md"
                  >
                    {error}
                  </motion.div>
                ) : response ? (
                  <motion.div
                    key="response"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-6"
                  >
                    <Card className="bg-white shadow-lg border-blue-100 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            style={{ originX: 0.5, originY: 0.5 }}
                            className="mr-2"
                          >
                            <div className="bg-blue-600 p-2 rounded-full">
                              <Stethoscope className="h-5 w-5 text-white" />
                            </div>
                          </motion.div>
                          <h2 className="text-xl font-semibold text-gray-800">Doctor's Response</h2>
                        </div>

                        <motion.div
                          variants={staggerContainer}
                          initial="initial"
                          animate="animate"
                          className="prose max-w-none"
                        >
                          {response.split("\n").map((paragraph: string, i: number) => (
                            <motion.p key={i} variants={fadeInUp} className="mb-4 text-gray-700">
                              {paragraph}
                            </motion.p>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>

                    {retrievedChunks.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.5 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setShowChunks(!showChunks)}
                          className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Database className="h-4 w-4" />
                          {showChunks ? "Hide Retrieved Data" : "Show Retrieved Data"}
                          {showChunks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>

                        <AnimatePresence>
                          {showChunks && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Card className="mt-4 bg-gray-50 border-blue-100">
                                <CardContent className="pt-6">
                                  <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                                    <Database className="h-4 w-4 mr-2 text-blue-600" />
                                    Retrieved Medical Data
                                  </h3>
                                  <motion.div
                                    variants={staggerContainer}
                                    initial="initial"
                                    animate="animate"
                                    className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                                  >
                                    {retrievedChunks.map((chunk, i) => (
                                      <motion.div
                                        key={i}
                                        variants={fadeInUp}
                                        className="p-3 bg-white rounded-md border border-gray-200 text-sm text-gray-600 hover:border-blue-300 transition-all duration-200"
                                        whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                                      >
                                        {chunk.length > 200 ? `${chunk.substring(0, 200)}...` : chunk}
                                      </motion.div>
                                    ))}
                                  </motion.div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                      className="mb-4 text-blue-500"
                    >
                      <MessageSquare className="h-12 w-12" />
                    </motion.div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Response Yet</h3>
                    <p className="text-gray-500 max-w-md">
                      Submit a medical question to receive a professional response from our virtual doctor.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
