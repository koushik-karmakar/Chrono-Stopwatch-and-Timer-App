import { useState } from "react";
import Stopwatch from "./components/Stopwatch";
import Timer from "./components/Timer";

export default function App() {
  const [mode, setMode] = useState("stopwatch");

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <header className="w-full max-w-md flex items-center justify-between mb-8">
        <span
          className="font-sans font-extrabold tracking-widest uppercase"
          style={{
            color: "#a78bfa",
            fontSize: "1.1rem",
            letterSpacing: "0.18em",
          }}
        >
          Chrono
        </span>

        <div
          className="flex p-1 gap-1 rounded-full"
          style={{
            background: "#111118",
            border: "0.5px solid rgba(255,255,255,0.13)",
          }}
        >
          <button
            className={`tab-btn ${mode === "stopwatch" ? "active" : ""}`}
            onClick={() => setMode("stopwatch")}
          >
            Stopwatch
          </button>
          <button
            className={`tab-btn ${mode === "timer" ? "active" : ""}`}
            onClick={() => setMode("timer")}
          >
            Timer
          </button>
        </div>
      </header>

      <main className="glass-card w-full max-w-md p-8 md:p-10">
        {mode === "stopwatch" ? <Stopwatch /> : <Timer />}
      </main>

      <footer
        className="mt-6 text-[0.65rem] tracking-widest uppercase font-bold"
        style={{ color: "#3a3850" }}
      >
        Precision Timing Tool
      </footer>
    </div>
  );
}
