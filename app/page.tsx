"use client"

import VirtualDoctor from "@/components/virtual-doctor"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-block mb-4">
            <motion.div
              className="relative w-20 h-20 mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <div className="absolute inset-0 bg-blue-600 rounded-full opacity-20 animate-ping" />
              <div className="relative flex items-center justify-center w-full h-full bg-blue-600 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-10 h-10 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 5.5h-15v13h15v-13z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 9.5h5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5" />
                </svg>
              </div>
            </motion.div>
          </div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Virtual Doctor
          </motion.h1>

          <motion.p
            className="text-gray-600 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Powered by Advanced Medical AI with RAG Technology
          </motion.p>
        </motion.header>

        <VirtualDoctor />

        <motion.footer
          className="mt-16 text-center text-sm text-gray-500 border-t border-gray-200 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="mb-2 font-medium">
            Disclaimer: This is an AI assistant and not a replacement for professional medical advice.
          </p>
          <p>Always consult with a qualified healthcare provider for medical concerns.</p>
        </motion.footer>
      </div>
    </main>
  )
}
