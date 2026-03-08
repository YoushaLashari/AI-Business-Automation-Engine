import { useState } from "react"
import Upload from "./components/Upload"
import Dashboard from "./components/Dashboard"
import Chat from "./components/Chat"

export default function App() {
  const [activePage, setActivePage] = useState("upload")

  const navItems = [
    { id: "upload", label: "Upload", icon: "↑" },
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "chat", label: "AI Chat", icon: "◎" },
  ]

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #E5E7EB",
        padding: "0 40px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "68px" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px",
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 12px rgba(79,70,229,0.35)"
            }}>⚡</div>
            <div>
              <div className="font-display" style={{ fontSize: "15px", fontWeight: 700, color: "#1E1B4B", letterSpacing: "-0.3px" }}>
                AI Automation Engine
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 500 }}>
                Multi-Agent Invoice Processing
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", gap: "4px" }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`nav-item ${activePage === item.id ? "nav-active" : ""}`}
              >
                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", background: "#ECFDF5", borderRadius: "20px", border: "1px solid #A7F3D0" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>All Systems Online</span>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px" }}>
        <div key={activePage} className="page-enter">
          {activePage === "upload" && <Upload />}
          {activePage === "dashboard" && <Dashboard />}
          {activePage === "chat" && <Chat />}
        </div>
      </main>
    </div>
  )
}