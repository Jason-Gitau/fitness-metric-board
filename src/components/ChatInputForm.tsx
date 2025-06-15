
import React from "react";
import { Button } from "./ui/button";
import { Loader } from "lucide-react";

interface ChatInputFormProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: (e?: React.FormEvent) => void;
  loading: boolean;
}

export function ChatInputForm({ input, setInput, handleSend, loading }: ChatInputFormProps) {
  return (
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
  );
}
