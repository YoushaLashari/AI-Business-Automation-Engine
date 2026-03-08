import { useState, useRef } from "react"
import axios from "axios"

const API = "http://localhost:8000"

const PIPELINE_STEPS = [
  { icon: "📁", label: "Input Agent", desc: "Receiving & validating file" },
  { icon: "🔍", label: "OCR Agent", desc: "Extracting text from document" },
  { icon: "🧠", label: "Neural Agent", desc: "Llama AI reading invoice fields" },
  { icon: "💾", label: "Database Agent", desc: "Saving to database" },
  { icon: "🔔", label: "Notification Agent", desc: "Dispatching alerts" },
]

export default function Upload() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState("idle")
  const [result, setResult] = useState(null)
  const [activeStep, setActiveStep] = useState(-1)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const handleUpload = async () => {
    if (!file) return
    setStatus("uploading")
    setResult(null)

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setActiveStep(i)
      await new Promise((r) => setTimeout(r, 600))
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post(`${API}/upload`, formData)
      setResult(res.data)
      setStatus(res.data.success ? "success" : "error")
    } catch (err) {
      setStatus("error")
      setResult({ error: err.message })
    }
    setActiveStep(-1)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) { setFile(f); setStatus("idle"); setResult(null) }
  }

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#EEF2FF", padding: "6px 14px", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ fontSize: "12px" }}>✦</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#4F46E5" }}>AI-Powered Processing</span>
        </div>
        <h1 className="font-display" style={{ fontSize: "40px", fontWeight: 800, color: "#1E1B4B", lineHeight: 1.15, marginBottom: "12px" }}>
          Upload Your Invoice<br />
          <span className="gradient-text">Let AI Do the Rest</span>
        </h1>
        <p style={{ color: "#6B7280", fontSize: "16px", lineHeight: 1.6 }}>
          Drop any PDF or image — 5 intelligent agents will extract, validate and store every detail automatically.
        </p>
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

        {/* Drop Zone */}
        <div
          className={`dropzone ${dragOver ? "dropzone-active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          style={{ padding: "40px 24px", textAlign: "center", minHeight: "240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        >
          <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => { setFile(e.target.files[0]); setStatus("idle"); setResult(null) }} style={{ display: "none" }} />

          {file ? (
            <div>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>📄</div>
              <div style={{ fontWeight: 700, color: "#1E1B4B", marginBottom: "4px" }}>{file.name}</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>{(file.size / 1024).toFixed(1)} KB</div>
              <div style={{ marginTop: "12px", display: "inline-block", background: "#EEF2FF", color: "#4F46E5", fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>
                ✓ Ready to process
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "44px", marginBottom: "12px", opacity: 0.4 }}>☁</div>
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Drop file here</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "16px" }}>PDF, PNG, JPG supported</div>
              <div style={{ background: "white", border: "1.5px solid #C7D2FE", color: "#4F46E5", fontSize: "13px", fontWeight: 600, padding: "8px 20px", borderRadius: "8px", display: "inline-block" }}>
                Browse Files
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div
              key={i}
              className={`pipeline-step ${
                status === "uploading"
                  ? activeStep > i ? "pipeline-step-done"
                  : activeStep === i ? "pipeline-step-active"
                  : "pipeline-step-idle"
                : "pipeline-step-idle"
              }`}
            >
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
                background: status === "uploading" && activeStep > i ? "#D1FAE5"
                  : status === "uploading" && activeStep === i ? "#EEF2FF"
                  : "#F3F4F6"
              }}>
                {status === "uploading" && activeStep > i ? "✓" : step.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px", color: status === "uploading" && activeStep >= i ? "#1E1B4B" : "#9CA3AF" }}>
                  {step.label}
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{step.desc}</div>
              </div>
              {status === "uploading" && activeStep === i && (
                <div style={{ marginLeft: "auto", display: "flex", gap: "3px" }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{
                      width: "5px", height: "5px", borderRadius: "50%",
                      background: "#4F46E5",
                      animation: `bounce 0.8s ease ${j*0.15}s infinite`
                    }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Process Button */}
      {file && status !== "uploading" && (
        <button className="btn-primary" onClick={handleUpload} style={{ width: "100%", fontSize: "15px", padding: "16px" }}>
          ⚡ Process Invoice with AI
        </button>
      )}

      {/* Success */}
      {status === "success" && result?.success && (
        <div className="card" style={{ padding: "28px", marginTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>✅</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#1E1B4B" }}>Invoice Processed Successfully!</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Saved to database · ID #{result.invoice_id}</div>
            </div>
          </div>
          <div className="divider" style={{ marginBottom: "20px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {Object.entries(result.fields).map(([key, value]) => (
              <div key={key} style={{ background: "#F9FAFB", borderRadius: "10px", padding: "14px 16px", border: "1px solid #F3F4F6" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                  {key.replace(/_/g, " ")}
                </div>
                <div style={{ fontWeight: 600, color: "#1E1B4B", fontSize: "14px" }}>{value ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <div style={{ marginTop: "20px", padding: "16px 20px", borderRadius: "12px", background: "#FEF2F2", border: "1px solid #FECACA" }}>
          <span style={{ color: "#DC2626", fontWeight: 600, fontSize: "14px" }}>❌ Processing failed — please try again</span>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}