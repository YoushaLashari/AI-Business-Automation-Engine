import { useState, useRef, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

const SUGGESTIONS = [
  { label: "Which invoices are overdue?", icon: "🕐" },
  { label: "What is the total amount of all invoices?", icon: "💰" },
  { label: "Who is the most recent vendor?", icon: "🏢" },
  { label: "Summarize all invoices", icon: "📋" },
]

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI invoice assistant powered by Llama 3.3 70B. I have direct access to your invoice database — ask me anything!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (question) => {
    const q = question || input
    if (!q.trim() || loading) return
    setMessages((prev) => [...prev, { role: "user", content: q }])
    setInput("")
    setLoading(true)
    try {
      const res = await axios.post(`${API}/chat`, { question: q })
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: res.data.answer,
        meta: `${res.data.invoices_analyzed} record(s) analyzed`
      }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#FDF2F8", padding: "6px 14px", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ fontSize: "12px" }}>◎</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#EC4899" }}>AI Assistant</span>
        </div>
        <h1 className="font-display" style={{ fontSize: "38px", fontWeight: 800, color: "#1E1B4B", lineHeight: 1.15, marginBottom: "12px" }}>
          Chat with Your<br />
          <span className="gradient-text">Invoice Database</span>
        </h1>
        <p style={{ color: "#6B7280", fontSize: "16px" }}>
          Ask anything in plain English — powered by Llama 3.3 70B via Groq
        </p>
      </div>

      {/* Suggestions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => sendMessage(s.label)}
            disabled={loading}
            style={{
              background: "white",
              border: "1.5px solid #E5E7EB",
              borderRadius: "20px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: "6px",
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C7D2FE"; e.currentTarget.style.color = "#4F46E5"; e.currentTarget.style.background = "#EEF2FF" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "white" }}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="card" style={{ overflow: "hidden", marginBottom: "16px" }}>

        {/* Window bar */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🧠</div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#1E1B4B" }}>Llama 3.3 · 70B</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Groq Cloud · Ultra Fast</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#ECFDF5", padding: "5px 12px", borderRadius: "20px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669" }}>Connected</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ height: "400px", overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", background: "#FDFCFF" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "10px", animation: "msgIn 0.25s ease both" }}>
              {msg.role === "assistant" && (
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, marginTop: "2px" }}>🧠</div>
              )}
              <div style={{ maxWidth: "72%" }}>
                <div className={msg.role === "user" ? "bubble-user" : "bubble-ai"}>
                  <p style={{ fontSize: "14px", lineHeight: 1.65, whiteSpace: "pre-wrap", margin: 0 }}>
                    {msg.content}
                  </p>
                </div>
                {msg.meta && (
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "5px", paddingLeft: "4px" }}>
                    ✦ {msg.meta}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>🧠</div>
              <div className="bubble-ai">
                <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "2px 0" }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#C7D2FE", animation: `bounce 0.8s ease ${j*0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "12px" }}>
        <input
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your invoices..."
          style={{ flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: "14px 28px", whiteSpace: "nowrap" }}
        >
          Send →
        </button>
      </div>

      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}