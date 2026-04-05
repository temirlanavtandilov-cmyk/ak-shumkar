'use client'

import { useState, useRef, useEffect, useCallback } from "react";
import TigerMascot from "@/components/TigerMascot";

// ── Constants ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Tigers Body Shop listing assistant — a friendly expert on eBay Motors auto parts listings. You help the seller review and adjust their listing before it goes live.

The seller can ask you to change the title, description, price, category, condition, item specifics, or vehicle compatibility. You can also suggest improvements proactively.

RULES:
1. When modifying something, respond with a brief confirmation AND a JSON block wrapped in <listing_update> tags containing ONLY the changed fields.
2. For item specifics, include the full itemSpecifics object with all existing fields plus changes.
3. For compatibility, include the full compatibility array.
4. If just answering a question, respond conversationally with no <listing_update> tags.
5. Be concise and knowledgeable about eBay Motors best practices.

Example: <listing_update>{"title": "New Title Here", "lean": {"price": "89.99"}}</listing_update>`;

const QUICK_ACTIONS = [
  "Review my listing",
  "Improve the title",
  "Suggest a better price",
  "Add vehicle compatibility",
  "Fix item specifics",
];

// ── Markdown renderer (no library) ───────────────────────────────────────────

function renderMarkdown(text) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^### (.+)/.test(line)) {
      out.push(<p key={i} style={{ fontWeight: 700, fontSize: 13, margin: "8px 0 2px" }}>{line.replace(/^### /, "")}</p>);
    } else if (/^## (.+)/.test(line)) {
      out.push(<p key={i} style={{ fontWeight: 700, fontSize: 14, margin: "10px 0 4px" }}>{line.replace(/^## /, "")}</p>);
    } else if (/^# (.+)/.test(line)) {
      out.push(<p key={i} style={{ fontWeight: 700, fontSize: 15, margin: "10px 0 4px" }}>{line.replace(/^# /, "")}</p>);
    } else if (/^[-*] (.+)/.test(line)) {
      out.push(<div key={i} style={{ display: "flex", gap: 6, margin: "2px 0" }}><span style={{ opacity: 0.5 }}>•</span><span>{inlineMarkdown(line.replace(/^[-*] /, ""))}</span></div>);
    } else if (/^\d+\. (.+)/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      out.push(<div key={i} style={{ display: "flex", gap: 6, margin: "2px 0" }}><span style={{ opacity: 0.5, minWidth: 14 }}>{num}.</span><span>{inlineMarkdown(line.replace(/^\d+\. /, ""))}</span></div>);
    } else if (line.trim() === "") {
      out.push(<div key={i} style={{ height: 6 }} />);
    } else {
      out.push(<p key={i} style={{ margin: "2px 0" }}>{inlineMarkdown(line)}</p>);
    }
    i++;
  }
  return out;
}

function inlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part))   return <em key={i}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part))     return <code key={i} style={{ background: "rgba(0,0,0,0.08)", padding: "1px 4px", borderRadius: 3, fontSize: 12 }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseListingUpdate(text) {
  const match = text.match(/<listing_update>\s*([\s\S]*?)\s*<\/listing_update>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return "__truncated__";
  }
}

function stripTags(text) {
  return text.replace(/<listing_update>[\s\S]*?<\/listing_update>/g, "").trim();
}

function trimHistory(msgs) {
  if (msgs.length <= 15) return msgs;
  return [msgs[0], msgs[1], ...msgs.slice(-10)];
}

// ── Inline styles ─────────────────────────────────────────────────────────────

const S = {
  overlay: (open) => ({
    position: "fixed", inset: 0, zIndex: 1000,
    pointerEvents: open ? "auto" : "none",
  }),
  panel: (open) => ({
    position: "fixed", top: 0, right: 0,
    width: 380, height: "100vh",
    background: "#F0F0EE",
    display: "flex", flexDirection: "column",
    boxShadow: open ? "-4px 0 24px rgba(0,0,0,0.15)" : "none",
    transform: open ? "translateX(0)" : "translateX(100%)",
    transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
    zIndex: 1001,
    fontFamily: "'Barlow', sans-serif",
    borderLeft: "1px solid #D8D8D5",
  }),
  header: {
    background: "#E4E4E1",
    borderBottom: "1px solid #D0D0CD",
    padding: "12px 16px",
    display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    display: "flex", flexDirection: "column", gap: 2,
  },
  titleText: {
    color: "#111", fontWeight: 700, fontSize: 15,
    fontFamily: "'Barlow Condensed', sans-serif",
    letterSpacing: 0.5, textTransform: "uppercase",
  },
  speechBubble: {
    background: "#D4D4D1", color: "#555",
    fontSize: 11, padding: "3px 8px", borderRadius: 8,
    display: "inline-block", marginTop: 2,
  },
  closeBtn: {
    background: "transparent", border: "1px solid #C8C8C5",
    color: "#777", width: 28, height: 28, borderRadius: 6,
    cursor: "pointer", fontSize: 16, display: "flex",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.15s",
  },
  messages: {
    flex: 1, overflowY: "auto", padding: "16px 14px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  quickActions: {
    padding: "0 14px 14px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  quickBtn: {
    background: "#fff", border: "1px solid #D0D0CD",
    color: "#333", padding: "8px 12px", borderRadius: 8,
    cursor: "pointer", fontSize: 13, textAlign: "left",
    transition: "all 0.15s", fontFamily: "'Barlow', sans-serif",
  },
  quickLabel: {
    color: "#888", fontSize: 11, fontWeight: 600,
    letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4,
  },
  msgRow: (role) => ({
    display: "flex",
    flexDirection: role === "user" ? "row-reverse" : "row",
    alignItems: "flex-end", gap: 8,
  }),
  bubble: (role) => ({
    maxWidth: "84%",
    background: role === "user"
      ? "linear-gradient(135deg, #FABF00 0%, #F6A910 100%)"
      : "linear-gradient(135deg, #009C4D 0%, #007E8B 100%)",
    color: "#fff",
    padding: "10px 13px",
    borderRadius: role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
    fontSize: 13, lineHeight: 1.6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  }),
  updateBadge: {
    marginTop: 5, display: "flex", gap: 5, flexWrap: "wrap",
  },
  badge: {
    background: "#0D3D1F", border: "1px solid #1A6B38",
    color: "#4ECA7F", fontSize: 10, fontWeight: 700,
    padding: "2px 7px", borderRadius: 10, letterSpacing: 0.3,
  },
  typingRow: {
    display: "flex", alignItems: "flex-end", gap: 8,
  },
  typingBubble: {
    background: "linear-gradient(135deg, #009C4D 0%, #007E8B 100%)",
    borderRadius: "14px 14px 14px 4px",
    padding: "12px 16px", display: "flex", gap: 5, alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  dot: (i) => ({
    width: 7, height: 7, borderRadius: "50%",
    background: "#FABF00",
    animation: `chatDotBounce 0.9s ease-in-out ${i * 0.15}s infinite`,
  }),
  inputArea: {
    borderTop: "1px solid #D0D0CD", padding: "12px 14px",
    display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0,
    background: "#E4E4E1",
  },
  textarea: {
    flex: 1, background: "#fff", border: "1px solid #C8C8C5",
    color: "#111", borderRadius: 10, padding: "9px 12px",
    fontSize: 13, fontFamily: "'Barlow', sans-serif",
    resize: "none", outline: "none", lineHeight: 1.5,
    minHeight: 38, maxHeight: 120,
    transition: "border-color 0.15s",
  },
  sendBtn: (disabled) => ({
    background: disabled ? "#1A1A1A" : "#009C4D",
    border: "none", borderRadius: 10,
    width: 38, height: 38,
    cursor: disabled ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "background 0.15s",
    color: disabled ? "#444" : "#fff",
    fontSize: 16,
  }),
  emptyState: {
    flex: 1, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 24,
    color: "#888", fontSize: 13, textAlign: "center", lineHeight: 1.6,
  },
};

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={S.typingRow}>
      <div style={S.typingBubble}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={S.dot(i)} />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Message({ msg }) {
  const { role, text, updatedFields } = msg;
  return (
    <div style={S.msgRow(role)}>
      <div>
        <div style={S.bubble(role)}>
          {role === "assistant" ? renderMarkdown(text) : text}
        </div>
        {updatedFields?.length > 0 && (
          <div style={S.updateBadge}>
            {updatedFields.map((f) => (
              <span key={f} style={S.badge}>✓ {f}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ListingChatAgent({ listing, onListingUpdate, isOpen, onClose, proxyUrl }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tigerState, setTigerState] = useState("idle");
  const [speechBubble, setSpeechBubble] = useState("How can I help?");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTigerState("idle");
      setSpeechBubble("How can I help?");
      setTimeout(() => textareaRef.current?.focus(), 350);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    if (!listing) return;

    const userMsg = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTigerState("scanning");
    setSpeechBubble("Reading…");

    await new Promise((r) => setTimeout(r, 300));
    setTigerState("thinking");
    setSpeechBubble("Thinking…");

    const listingContext = `\n\n[CURRENT LISTING]\n${JSON.stringify(listing, null, 2)}`;
    const history = trimHistory([...messages, userMsg]);
    const apiMessages = history.map((m) => ({
      role: m.role,
      content: m.role === "user" && m === history[history.length - 1]
        ? m.text + listingContext
        : m.text,
    }));

    try {
      const resp = await fetch(`${proxyUrl}/anthropic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      if (resp.status === 401) throw new Error("API key issue — check your Worker configuration.");
      if (resp.status === 429) throw new Error("Too many requests, wait a moment.");
      if (!resp.ok) throw new Error(`Request failed (${resp.status})`);

      const data = await resp.json();
      const raw = data?.content?.[0]?.text || "";

      const update = parseListingUpdate(raw);
      const truncated = update === "__truncated__";
      const validUpdate = truncated ? null : update;
      const displayText = truncated
        ? stripTags(raw) + "\n\n⚠ Response was cut off — please try again with a simpler request."
        : stripTags(raw);
      const updatedFields = validUpdate ? Object.keys(validUpdate) : [];

      if (validUpdate) {
        onListingUpdate(validUpdate);
        setTigerState("success");
        setSpeechBubble("Updated!");
      } else {
        setTigerState(truncated ? "error" : "idle");
        setSpeechBubble(truncated ? "Try again" : "Anything else?");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: displayText, updatedFields },
      ]);

      setTimeout(() => {
        if (update) {
          setTigerState("idle");
          setSpeechBubble("Anything else?");
        }
      }, 1800);

    } catch (err) {
      setTigerState("error");
      setSpeechBubble("Oops!");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `⚠ ${err.message}`, updatedFields: [] },
      ]);
      setTimeout(() => {
        setTigerState("idle");
        setSpeechBubble("How can I help?");
      }, 2000);
    } finally {
      setLoading(false);
    }
  }, [listing, messages, loading, onListingUpdate, proxyUrl]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showQuickActions = messages.length === 0 && !loading;
  const canSend = input.trim().length > 0 && !loading && !!listing;

  return (
    <>
      <style>{`
        @keyframes chatDotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      <div
        style={S.overlay(isOpen)}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      />

      <div style={S.panel(isOpen)}>
        <div style={S.header}>
          <TigerMascot state={tigerState} />
          <div style={S.headerTitle}>
            <span style={S.titleText}>Listing Assistant</span>
            <span style={S.speechBubble}>{speechBubble}</span>
          </div>
          <button
            style={S.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#D0D0CD"; e.currentTarget.style.color = "#111"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#777"; }}
          >
            ✕
          </button>
        </div>

        {!listing ? (
          <div style={S.emptyState}>
            Generate a listing first,<br />then I can help you adjust it.
          </div>
        ) : (
          <>
            <div style={S.messages}>
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {showQuickActions && (
              <div style={S.quickActions}>
                <div style={S.quickLabel}>Quick actions</div>
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    style={S.quickBtn}
                    onClick={() => sendMessage(action)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F5F2"; e.currentTarget.style.borderColor = "#009C4D"; e.currentTarget.style.color = "#009C4D"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#D0D0CD"; e.currentTarget.style.color = "#333"; }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div style={S.inputArea}>
              <textarea
                ref={textareaRef}
                style={S.textarea}
                rows={1}
                placeholder={listing ? "Ask me anything about your listing…" : "Generate a listing first"}
                value={input}
                disabled={!listing || loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => { e.target.style.borderColor = "#009C4D"; }}
                onBlur={(e) => { e.target.style.borderColor = "#333"; }}
              />
              <button
                style={S.sendBtn(!canSend)}
                disabled={!canSend}
                onClick={() => sendMessage(input)}
              >
                ↑
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
