import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Ask me for picks — e.g. \"any games today?\" or \"what do you think of Arsenal vs Chelsea?\". AI-generated opinions, not guaranteed outcomes."
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages: Message[] = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!res.ok) throw new Error("Request failed");

      const data = (await res.json()) as { reply: string };
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Something went wrong fetching a response. Try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "max(24px, env(safe-area-inset-bottom))",
        right: "max(24px, env(safe-area-inset-right))",
        zIndex: 9999
      }}
    >
      {isOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "min(360px, calc(100vw - 48px))",
            height: "min(520px, calc(100vh - 120px))",
            marginBottom: "12px",
            backgroundColor: "#121212",
            border: "1px solid #2a2a2a",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            fontFamily: "'Bebas Neue', sans-serif"
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #2a2a2a",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontSize: "18px", letterSpacing: "1px", color: "#fff" }}>
              SOCCERRAI ASSISTANT
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: "none",
                border: "none",
                color: "#aaa",
                fontSize: "18px",
                cursor: "pointer",
                lineHeight: 1,
                padding: "4px"
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start"
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: m.role === "user" ? "#22c55e" : "#1e1e1e",
                    color: "#f0f0f0",
                    fontSize: "14px",
                    fontFamily: "system-ui, sans-serif",
                    lineHeight: "1.4",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ color: "#888", fontSize: "13px", fontFamily: "system-ui, sans-serif" }}>
                Thinking...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #2a2a2a" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about today's games..."
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "6px",
                border: "1px solid #2a2a2a",
                backgroundColor: "#1a1a1a",
                color: "#fff",
                fontSize: "14px",
                fontFamily: "system-ui, sans-serif",
                outline: "none"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                marginLeft: "8px",
                padding: "9px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#22c55e",
                color: "#fff",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#22c55e",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto"
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}