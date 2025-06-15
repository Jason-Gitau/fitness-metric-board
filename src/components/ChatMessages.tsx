
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  from: "user" | "bot";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  open: boolean;
}

export function ChatMessages({ messages, open }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  return (
    <div className="flex-1 flex flex-col px-3 py-2 overflow-y-auto max-h-[350px]" style={{ minHeight: "160px" }}>
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
  );
}
