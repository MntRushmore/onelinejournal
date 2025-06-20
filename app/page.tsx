"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Pen, RefreshCw, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import AnimatedBackground from "@/components/ui/AnimatedBackground"

const AuthModal = dynamic(() => import("@/components/auth-modal").then(mod => mod.AuthModal), { ssr: false })

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY
      document.documentElement.style.setProperty("--scroll", `${scroll * 0.05}px`)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          router.replace("/dashboard") // use replace instead of push to avoid history mismatch
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000] text-white relative overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000] text-white relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent mb-6">
          OneLineJournal
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-xl">
          Your daily space to reflect, remember, and grow! One sentence at a time.
        </p>
        <Button
          size="lg"
          className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition duration-300 shadow-xl"
          onClick={() => setShowAuthModal(true)}
        >
          Start Journaling
        </Button>
      </div>

      <div className="relative z-10 py-24 bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-6 rounded-xl border border-white/10 bg-gradient-to-br from-purple-800/20 to-transparent hover:from-purple-600/30 transition-transform transform hover:-translate-y-2 hover:shadow-lg">
              <Pen className="h-14 w-14 mx-auto mb-4 text-purple-300 group-hover:text-purple-100 transition-colors" />
              <h3 className="text-2xl font-bold mb-2 group-hover:text-white">Write</h3>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors">
                Capture your day in just one line. Make it meaningful.
              </p>
            </div>
            <div className="group p-6 rounded-xl border border-white/10 bg-gradient-to-br from-blue-800/20 to-transparent hover:from-blue-600/30 transition-transform transform hover:-translate-y-2 hover:shadow-lg">
              <RefreshCw className="h-14 w-14 mx-auto mb-4 text-blue-300 group-hover:text-blue-100 transition-colors" />
              <h3 className="text-2xl font-bold mb-2 group-hover:text-white">Reflect</h3>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors">
                Build a habit of mindful daily reflection.
              </p>
            </div>
            <div className="group p-6 rounded-xl border border-white/10 bg-gradient-to-br from-pink-800/20 to-transparent hover:from-pink-600/30 transition-transform transform hover:-translate-y-2 hover:shadow-lg">
              <Clock className="h-14 w-14 mx-auto mb-4 text-pink-300 group-hover:text-pink-100 transition-colors" />
              <h3 className="text-2xl font-bold mb-2 group-hover:text-white">Remember</h3>
              <p className="text-gray-400 group-hover:text-gray-200 transition-colors">
                Scroll back and see your growth over time.
              </p>
            </div>
          </div>
          <div className="mt-16">
            <Button
              size="lg"
              className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition duration-300 shadow-xl"
              onClick={() => setShowAuthModal(true)}
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-500 bg-black/50 border-t border-white/10">
        © 2025 OneLineJournal. All rights reserved.
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
