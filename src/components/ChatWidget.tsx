import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// Helper function to generate a pseudo-unique session id
function generateSessionId() {
  return (
    "sess_" +
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36)
  );
}

interface Message {
  id: string;
  from: "user" | "bot";
  content: string;
}

const WEBHOOK_URL =
  "https://naturally-tolerant-leech.ngrok-free.app/webhook-test/d14345ad-fdb3-494f-ac97-9b84245b60b8";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Generate session ID on first mount
  const [sessionId] = useState(() => generateSessionId());

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;
    setLoading(true);
    setError("");
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        from: "user",
        content: prompt,
      },
    ]);
    setInput("");
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          sessionId,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();

      // STRICT PARSING: only display the "output" field from response
      let botMsg: string;
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0]?.response?.body?.output
      ) {
        botMsg = data[0].response.body.output;
      } else {
        botMsg = "Sorry, no message was returned.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          from: "bot",
          content: botMsg,
        },
      ]);
    } catch (err: any) {
      setError("Failed to get response. Try again!");
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          from: "bot",
          content: "Sorry, I couldn't connect to the chatbot.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed z-50 bottom-6 right-6 bg-blue-600 rounded-full shadow-lg p-4 hover:scale-105 focus:outline-none transition-all"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle className="text-white w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed z-50 bottom-6 right-6 w-[350px] max-w-[92vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-blue-600 rounded-t-xl">
            <div className="flex items-center gap-2 text-white font-bold">
              <MessageCircle className="w-5 h-5" /> Chat Assistant
            </div>
            <button
              className="text-white hover:bg-blue-700 rounded-full p-1 transition"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div
            className="flex-1 flex flex-col px-3 py-2 overflow-y-auto max-h-[350px]"
            style={{ minHeight: "160px" }}
          >
            <div className="flex flex-col gap-2">
              {messages.length === 0 && (
                <div className="text-gray-400 text-sm mt-2 text-center">
                  Start chatting! Ask me anything about the gym.
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm whitespace-pre-line",
                    msg.from === "user"
                      ? "bg-blue-100 self-end text-gray-800"
                      : "bg-gray-100 self-start text-gray-700"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
          <form
            className="flex items-center gap-2 border-t px-3 py-2"
            onSubmit={handleSend}
          >
            <input
              type="text"
              className="flex-1 bg-transparent outline-none border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSend(e);
              }}
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="h-9 px-4"
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                "Send"
              )}
            </Button>
          </form>
          {error && (
            <div className="p-2 text-xs text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
}
