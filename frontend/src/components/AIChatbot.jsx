import { useState, useRef, useEffect } from "react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! 👋 I'm your shopping assistant. Ask me like 'gaming laptop under 1 lakh' or 'best watch under 5000'!" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL?.replace(/\/api.*$/, "") || "http://127.0.0.1:8000";
      const res = await fetch(`${API_BASE}/api/ai/chat/`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.message || data.ai_answer || "No reply" }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "AI is offline bro! Check backend is running!" }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed", bottom: "20px", right: "20px", width: "60px", height: "60px",
          borderRadius: "50%", background: "#FF9900", border: "none", fontSize: "28px",
          cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 1000
        }}
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", bottom: "90px", right: "20px", width: "360px", height: "480px",
          background: "white", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden"
        }}>
          <div style={{ background: "#131921", color: "white", padding: "15px", fontWeight: "bold", display: "flex", justifyContent: "space-between" }}>
            <span>🛒 AI Shopping Assistant</span>
            <span style={{ fontSize: "10px", background: "#00ff00", color: "black", padding: "2px 6px", borderRadius: "10px" }}>● LIVE</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "15px", background: "#f3f3f3", display: "flex", flexDirection: "column" }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                margin: "8px 0", padding: "10px 12px", borderRadius: "12px",
                maxWidth: "80%", whiteSpace: "pre-wrap",
                background: m.role === "user" ? "#FF9900" : "white",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                marginLeft: m.role === "user" ? "auto" : "0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ fontSize: "12px", fontStyle: "italic", color: "#666" }}>AI is thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd", background: "white" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about products..."
              style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc", outline: "none" }}
            />
            <button onClick={sendMessage} disabled={loading} style={{ marginLeft: "8px", background: "#FF9900", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer" }}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}