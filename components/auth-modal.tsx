"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()

  const ensureProfileExists = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase.from("profiles").insert([{ id: userId, email: userEmail }])

      if (error && error.code !== "23505") {
        console.error("Error creating profile:", error)
      }
    } catch (error) {
      console.error("Error ensuring profile exists:", error)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      if (data.user) {
        await ensureProfileExists(data.user.id, data.user.email!)

        if (data.user.email_confirmed_at) {
    
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData.session) {
            router.push("/dashboard")
            onClose()
          } else {
            setMessage("Account created! Please sign in to continue.")
          }
        } else {
          setMessage("Please check your email and click the confirmation link to activate your account.")
        }
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user && data.session) {
        await ensureProfileExists(data.user.id, data.user.email!)

        router.push("/dashboard")
        onClose()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-lg border border-white/10 text-white shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-extrabold text-center mb-4">Welcome to OneLineJournal</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 backdrop-blur-md rounded-full p-1 mb-4">
            <TabsTrigger value="signin" className="data-[state=active]:bg-white data-[state=active]:text-black text-white rounded-full px-4 py-2 transition">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-black text-white rounded-full px-4 py-2 transition">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4 flex flex-col items-center animate-fade-in">
              <div className="space-y-2 w-full">
                <Label htmlFor="signin-email" className="text-white">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-white focus:border-white"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="signin-password" className="text-white">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-white focus:border-white"
                />
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              {message && <p className="text-sm text-green-400 text-center">{message}</p>}
              <Button type="submit" className="w-full bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition duration-300 shadow-lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4 flex flex-col items-center animate-fade-in">
              <div className="space-y-2 w-full">
                <Label htmlFor="signup-email" className="text-white">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-white focus:border-white"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="signup-password" className="text-white">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-white focus:border-white"
                />
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              {message && <p className="text-sm text-green-400 text-center">{message}</p>}
              <Button type="submit" className="w-full bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition duration-300 shadow-lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
