"use client"

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-[160px] rounded-full animate-[spin_60s_linear_infinite]"
        style={{ transform: "translateY(calc(var(--scroll) * 1.2))" }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-blue-400 via-purple-600 to-indigo-500 opacity-30 blur-[100px] rounded-full animate-[ping_4s_ease-in-out_infinite]"
        style={{ transform: "translateY(calc(var(--scroll) * 0.8))" }}
      />
      <div
        className="absolute bottom-0 left-20 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500 to-purple-500 opacity-20 blur-[140px] rounded-full animate-[pulse_10s_ease-in-out_infinite]"
        style={{ transform: "translateY(calc(var(--scroll) * 0.5))" }}
      />
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-b from-green-400 via-blue-500 to-purple-600 opacity-25 blur-[120px] rounded-full animate-[bounce_12s_ease-in-out_infinite]"
        style={{ transform: "translateY(calc(var(--scroll) * 1.5))" }}
      />
    </div>
  )
}