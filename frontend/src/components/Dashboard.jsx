import { useState, useEffect, useRef } from "react"
import axios from "axios"

const API = "https://ai-business-automation-engine-production.up.railway.app"

function AnimatedCounter({ target, duration = 1500, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/invoices`)
      setInvoices(res.data.invoices)
      setLoaded(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteInvoice = async (id) => {
    if (!confirm(`Delete invoice #${id}?`)) return
    setDeleting(id)
    try {
      await axios.delete(`${API}/invoices/${id}`)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch {
      alert("Delete failed")
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  const vendors = [...new Set(invoices.map(inv => inv.vendor))].length

  const stats = [
    { label: "Total Invoices", value: invoices.length, prefix: "", suffix: "", icon: "📄", color: "#4F46E5" },
    { label: "Total Value", value: totalAmount, prefix: "$", suffix: "", icon: "💰", color: "#7C3AED" },
    { label: "Unique Vendors", value: vendors, prefix: "", suffix: "", icon: "🏢", color: "#EC4899" },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#F5F3FF", padding: "6px 14px", borderRadius: "20px", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px" }}>▦</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED" }}>Invoice Records</span>
          </div>
          <h1 className="font-display" style={{ fontSize: "38px", fontWeight: 800, color: "#1E1B4B", lineHeight: 1.15 }}>
            Invoice<br />
            <span className="gradient-text">Command Center</span>
          </h1>
        </div>
        <button className="btn-secondary" onClick={fetchInvoices}>
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {stat.label}
              </div>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${stat.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                {stat.icon}
              </div>
            </div>
            <div className="font-display" style={{ fontSize: "34px", fontWeight: 800, color: stat.color }}>
              {loaded ? <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} /> : `${stat.prefix}0`}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}>⏳</div>
          <div style={{ color: "#9CA3AF", fontWeight: 500 }}>Loading invoices...</div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="card" style={{ padding: "80px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <div className="font-display" style={{ fontSize: "18px", fontWeight: 700, color: "#1E1B4B", marginBottom: "8px" }}>No invoices yet</div>
          <div style={{ color: "#9CA3AF" }}>Upload your first invoice to get started</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden", padding: 0 }}>
          {/* Table Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", display: "grid", gridTemplateColumns: "60px 160px 1fr 130px 130px 120px 100px 90px", gap: "8px" }}>
            {["ID", "Invoice #", "Vendor", "Date", "Due Date", "Amount", "Status", "Action"].map((h) => (
              <div key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {invoices.map((inv, i) => (
            <div
              key={inv.id}
              className="table-row"
              style={{
                display: "grid",
                gridTemplateColumns: "60px 160px 1fr 130px 130px 120px 100px 90px",
                gap: "8px",
                padding: "16px 24px",
                alignItems: "center",
                borderBottom: i < invoices.length - 1 ? "1px solid #F9FAFB" : "none",
                animation: `fadeIn 0.3s ease ${i * 0.04}s both`
              }}
            >
              <div style={{ fontSize: "13px", color: "#D1D5DB", fontWeight: 600 }}>#{inv.id}</div>
              <div className="font-mono" style={{ fontSize: "12px", color: "#4F46E5", fontWeight: 600 }}>{inv.invoice_number}</div>
              <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{inv.vendor}</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{inv.date}</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{inv.due_date ?? "—"}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#7C3AED" }}>
                {inv.currency} {inv.total_amount?.toLocaleString()}
              </div>
              <div>
                <span className="badge badge-success">{inv.status}</span>
              </div>
              <div>
                <button
                  onClick={() => deleteInvoice(inv.id)}
                  disabled={deleting === inv.id}
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#DC2626",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2" }}
                >
                  {deleting === inv.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}