"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { LogOut, Calendar, ArrowRight } from "lucide-react"
import { format, parseISO } from "date-fns"

interface JournalEntry {
  id: string
  entry_text: string
  entry_date: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [todayEntry, setTodayEntry] = useState("")
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasEntryToday, setHasEntryToday] = useState(false)
  const [error, setError] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push("/")
        return
      }

      setUser(session.user)

      await ensureProfileExists(session.user.id)
      await loadEntries(session.user.id)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/")
    }
  }

  const ensureProfileExists = async (userId: string) => {
    try {
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", userId).single()

      if (!existingProfile) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user?.email) {
          const { error } = await supabase.from("profiles").insert([{ id: userId, email: user.email }])

          if (error && error.code !== "23505") {
            console.error("Error creating profile:", error)
          }
        }
      }
    } catch (error) {
      console.error("Error ensuring profile exists:", error)
    }
  }

  const loadEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: false })

      if (error) throw error

      setEntries(data || [])

      const todayEntryExists = data?.find((entry) => entry.entry_date === today)
      if (todayEntryExists) {
        setTodayEntry(todayEntryExists.entry_text)
        setHasEntryToday(true)
      }
    } catch (error) {
      console.error("Error loading entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async () => {
    if (!user || !todayEntry.trim()) return

    setSaving(true)
    setError("")

    try {
      await ensureProfileExists(user.id)

      if (hasEntryToday) {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            entry_text: todayEntry.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("entry_date", today)

        if (error) throw error
      } else {
        const { error } = await supabase.from("journal_entries").insert([
          {
            user_id: user.id,
            entry_text: todayEntry.trim(),
            entry_date: today,
          },
        ])

        if (error) throw error
        setHasEntryToday(true)
      }

      await loadEntries(user.id)
      setError("")
    } catch (error: any) {
      console.error("Error saving entry:", error)
      setError("Failed to save entry. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      saveEntry()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000] text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-[160px] rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-blue-400 via-purple-600 to-indigo-500 opacity-30 blur-[100px] rounded-full animate-[ping_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 left-20 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500 to-purple-500 opacity-20 blur-[140px] rounded-full animate-[pulse_10s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10 animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000] text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-[160px] rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-blue-400 via-purple-600 to-indigo-500 opacity-30 blur-[100px] rounded-full animate-[ping_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-20 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500 to-purple-500 opacity-20 blur-[140px] rounded-full animate-[pulse_10s_ease-in-out_infinite]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-white/10 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">OneLineJournal</h1>
          <Button variant="ghost" onClick={handleSignOut} className="text-gray-300 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Today's Reflection</h2>
            <span className="text-sm font-normal text-gray-300 ml-auto">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          <div className="relative mb-2">
            <div className="relative bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-0 transition-all duration-300 shadow-lg">
              <div className="flex items-center">
                <input
                  type="text"
                  value={todayEntry}
                  onChange={(e) => setTodayEntry(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="How was your day? One meaningful sentence..."
                  maxLength={280}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 text-base focus:outline-none px-6 py-3 rounded-l-full"
                />
                <Button
                  onClick={saveEntry}
                  disabled={!todayEntry.trim() || saving}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full min-w-[44px] h-[44px] mr-1 flex items-center justify-center transition-all duration-300 border border-white/10"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-400 mt-2 ml-6">{todayEntry.length}/280 characters</div>
            {error && <p className="text-sm text-red-400 mt-2 ml-6">{error}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-6 text-white">Your Journey</h2>
          {entries.length === 0 ? (
            <div className="border-dashed border-2 border-white/10 rounded-2xl p-8 text-center bg-white/5">
              <p className="text-gray-400">Your journal timeline will appear here once you start journaling.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-white/10 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg bg-white/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      {format(parseISO(entry.entry_date), "EEEE, MMMM d, yyyy")}
                    </span>
                    {entry.entry_date === today && (
                      <span className="text-xs bg-white text-black px-2 py-1 rounded-full">Today</span>
                    )}
                  </div>
                  <p className="text-white leading-relaxed">{entry.entry_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
