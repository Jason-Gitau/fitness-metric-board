
import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { extractOutput } from "./chatHelpers";
import { ChatMessages } from "./ChatMessages";
import { ChatInputForm } from "./ChatInputForm";

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
  const [sessionId] = useState(() => generateSessionId());

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
      console.log("Webhook raw response:", data);

      const output = extractOutput(data);

      let botMsg: string;
      if (typeof output === "string" && output.trim()) {
        botMsg = output.trim();
      } else {
        botMsg = "Sorry, no response received from the bot.";
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
          <ChatMessages messages={messages} open={open} />
          <ChatInputForm
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={loading}
          />
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
