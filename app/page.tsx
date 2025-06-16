"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Pen, RefreshCw, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AuthModal } from "@/components/auth-modal"
import { useRouter } from "next/navigation"

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
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        router.push("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
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
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-[160px] rounded-full animate-[spin_60s_linear_infinite]" style={{ transform: "translateY(calc(var(--scroll) * 1.2))" }} />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-blue-400 via-purple-600 to-indigo-500 opacity-30 blur-[100px] rounded-full animate-[ping_4s_ease-in-out_infinite]" style={{ transform: "translateY(calc(var(--scroll) * 0.8))" }} />
        <div className="absolute bottom-0 left-20 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500 to-purple-500 opacity-20 blur-[140px] rounded-full animate-[pulse_10s_ease-in-out_infinite]" style={{ transform: "translateY(calc(var(--scroll) * 0.5))" }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-green-400 via-blue-500 to-purple-600 opacity-25 blur-[120px] rounded-full animate-[bounce_12s_ease-in-out_infinite]" style={{ transform: "translateY(calc(var(--scroll) * 1.5))" }} />
      </div>

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
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <Pen className="h-10 w-10 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Write</h3>
              <p className="text-gray-400">Capture your day in just one line. Make it meaningful.</p>
            </div>
            <div>
              <RefreshCw className="h-10 w-10 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Reflect</h3>
              <p className="text-gray-400">Build a habit of mindful daily reflection.</p>
            </div>
            <div>
              <Clock className="h-10 w-10 mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-semibold mb-2">Remember</h3>
              <p className="text-gray-400">Scroll back and see your growth over time.</p>
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
