"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { LogOut, Calendar, ArrowRight } from "lucide-react"
import { format, parseISO } from "date-fns"
import AnimatedBackground from "@/components/ui/AnimatedBackground"

interface JournalEntry {
  id: string
  entry_text: string
  entry_date: string
  created_at: string
}

export default function Dashboard() {
  const [tab, setTab] = useState<"today" | "past">("today")
  const [user, setUser] = useState<any>(null)
  const [todayEntry, setTodayEntry] = useState("")
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [hasEntryToday, setHasEntryToday] = useState(false)
  const [visibleCount, setVisibleCount] = useState(7)
  const router = useRouter()

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push("/")
      return
    }

    setUser(session.user)
    await loadEntries(session.user.id)
    setLoading(false)
  }

  const loadEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error loading entries:", error)
      return
    }

    setEntries(data || [])

    const todayEntryExists = data?.find((entry) => entry.entry_date === today)
    if (todayEntryExists) {
      setTodayEntry(todayEntryExists.entry_text)
      setHasEntryToday(true)
    }
  }

  const saveEntry = async () => {
    if (!user || !todayEntry.trim()) return
    setSaving(true)
    setError("")

    try {
      if (hasEntryToday) {
        await supabase
          .from("journal_entries")
          .update({ entry_text: todayEntry.trim(), updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("entry_date", today)
      } else {
        await supabase.from("journal_entries").insert([{
          user_id: user.id,
          entry_text: todayEntry.trim(),
          entry_date: today,
        }])
        setHasEntryToday(true)
      }

      await loadEntries(user.id)
    } catch (err: any) {
      console.error("Error saving entry:", err)
      setError("Failed to save entry. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        <AnimatedBackground />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000] text-white relative overflow-hidden">
      <AnimatedBackground />

      <header className="relative z-10 border-b border-white/10 bg-white/10 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">OneLineJournal</h1>
          <Button variant="ghost" onClick={handleSignOut} className="text-gray-300 hover:text-white">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <div className="flex justify-center mb-8 space-x-4">
          <Button
            variant="ghost"
            className={`px-6 py-2 rounded-lg text-base font-semibold transition-colors ${
              tab === "today" ? "bg-white/10 text-white hover:bg-white/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            onClick={() => setTab("today")}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            className={`px-6 py-2 rounded-lg text-base font-semibold transition-colors ${
              tab === "past" ? "bg-white/10 text-white hover:bg-white/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            onClick={() => setTab("past")}
          >
            Past Entries
          </Button>
        </div>

        {tab === "today" && (
          <div>
            <div className="mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Today's Reflection</h2>
              <span className="ml-auto text-sm text-gray-400">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </span>
            </div>

            <div className="relative mb-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
              <div className="flex items-center p-4">
                <input
                  type="text"
                  value={todayEntry}
                  onChange={(e) => setTodayEntry(e.target.value)}
                  placeholder="How was your day? One meaningful sentence..."
                  maxLength={280}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 text-base focus:outline-none px-4"
                />
                <Button
                  onClick={saveEntry}
                  disabled={!todayEntry.trim() || saving}
                  className="ml-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-400 mb-2">{todayEntry.length}/280 characters</div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}

        {tab === "past" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Past Entries</h2>

            {entries.length === 0 ? (
              <p className="text-gray-400">No past entries yet.</p>
            ) : (
              <div className="space-y-4">
                {entries.slice(0, visibleCount).map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-white/10 rounded-2xl p-4 bg-white/10 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">
                        {format(parseISO(entry.entry_date), "EEEE, MMMM d, yyyy")}
                      </span>
                      {entry.entry_date === today && (
                        <span className="text-xs bg-white text-black px-2 py-1 rounded-full">Today</span>
                      )}
                    </div>
                    <p className="text-white">{entry.entry_text}</p>
                  </div>
                ))}

                {visibleCount < entries.length && (
                  <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={() => setVisibleCount(visibleCount + 7)}>
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
