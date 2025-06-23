"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, RefreshCcw, ArrowRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import AnimatedBackground from "@/components/ui/AnimatedBackground"

interface JournalEntry {
  id: string
  entry_text: string
  entry_date: string
  created_at: string
}

const prompts = [
  "What moment today made you smile?",
  "What challenged you today?",
  "One thing you're grateful for?",
  "Something you learned?",
  "How are you feeling right now?",,
  "What do you want to remember about today?",
  "Who did you connect with today?",
  "What surprised you today?"
]

export default function Dashboard() {
  const [tab, setTab] = useState<"today" | "past">("today")
  const [user, setUser] = useState<any>(null)
  const [todayEntry, setTodayEntry] = useState("")
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasEntryToday, setHasEntryToday] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [streak, setStreak] = useState(0)
  const [visibleCount, setVisibleCount] = useState(7)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const router = useRouter()
  const today = new Date().toLocaleDateString("en-CA")

  useEffect(() => {
    checkUser()
    setPrompt(prompts[Math.floor(Math.random() * prompts.length)])
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return router.push("/")
    setUser(session.user)
    await loadEntries(session.user.id)
    setLoading(false)
  }

  const loadEntries = async (userId: string) => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: false })

    setEntries(data || [])
    console.log("Loaded entries:", data)
    calculateStreak(data || [])

    const existing = data?.find(e => e.entry_date === today)
    if (existing) {
      setTodayEntry(existing.entry_text)
      setHasEntryToday(true)
    }
  }

  const calculateStreak = (entries: JournalEntry[]) => {
    const now = new Date()
    let count = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const ds = d.toISOString().split("T")[0]
      if (entries.find(e => e.entry_date === ds)) count++
      else break
    }
    setStreak(count)
  }

  const saveEntry = async () => {
    if (!user || !todayEntry.trim()) return
    setSaving(true)

    try {
      if (hasEntryToday) {
        await supabase.from("journal_entries").update({ entry_text: todayEntry.trim() }).eq("user_id", user.id).eq("entry_date", today)
      } else {
        await supabase.from("journal_entries").insert([{ user_id: user.id, entry_text: todayEntry.trim(), entry_date: today }])
        setHasEntryToday(true)
      }
      await loadEntries(user.id)
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
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <AnimatedBackground />
      <header className="sticky top-0 z-20 bg-neutral-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">OneLineJournal</h1>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Tabs value={tab} onValueChange={(v) => {
          setTab(v as "today" | "past")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}>
          <TabsList className="mb-6">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="past">Past Entries</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <div className="flex justify-center mb-4">
              <Badge variant="secondary" className="px-3 py-1">
                🔥 {streak} day{streak !== 1 && "s"} streak
              </Badge>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Prompt of the Day</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="italic text-gray-300">"{prompt}"</p>
                <Button variant="ghost" size="sm" onClick={() => {
                  const newPrompt = prompts[Math.floor(Math.random() * prompts.length)]
                  setPrompt(newPrompt)
                }}>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  New
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Entry</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3 items-center">
                <Input
                  type="text"
                  placeholder="How was your day?"
                  value={todayEntry}
                  onChange={(e) => setTodayEntry(e.target.value)}
                  maxLength={280}
                  disabled={hasEntryToday}
                />
                <Button onClick={saveEntry} disabled={!todayEntry.trim() || saving || hasEntryToday}>
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : hasEntryToday ? "✓" : <ArrowRight className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasEntry: entries.map(e => new Date(e.entry_date))
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      position: "relative",
                      "&::after": {
                        content: "''",
                        position: "absolute",
                        bottom: "4px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "6px",
                        height: "6px",
                        borderRadius: "9999px",
                        backgroundColor: "#facc15"
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            {entries.length === 0 && (
              <Card className="py-12 text-center text-muted-foreground">
                <CardContent>
                  <p>You haven’t written any entries yet.</p>
                </CardContent>
              </Card>
            )}

            {(selectedDate
              ? entries.filter(e => e.entry_date === selectedDate.toISOString().split("T")[0])
              : entries.slice(0, visibleCount)
            ).filter(e => typeof e.entry_text === "string" && e.entry_text.trim().length > 0).map(entry => (
              <Card key={entry.id} className="mb-4 animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {format(parseISO(entry.entry_date), "eeee, MMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{entry.entry_text}</p>
                </CardContent>
              </Card>
            ))}

            {selectedDate && entries.filter(e => e.entry_date === selectedDate.toISOString().split("T")[0]).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No entry for this date.
              </div>
            )}

            {!selectedDate && visibleCount < entries.length && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setVisibleCount(visibleCount + 5)}>Load More</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    <footer className="mt-20 text-center text-sm text-muted-foreground py-6">
      &copy; {new Date().getFullYear()} OneLineJournal
    </footer>
    </div>
  )
}
