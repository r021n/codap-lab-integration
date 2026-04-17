import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Card } from "../../../ui/card";
import { sendMessage, type ChatMessage } from "../../../../api/investigasi.api";

interface Step2ChatProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

export default function Step2Chat({
  messages,
  setMessages,
  user,
}: Step2ChatProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Optimistic update
    const tempMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await sendMessage(userMessage, 2);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error(error);
      // In a real app, I'd show an error message in chat
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to format links in text
  const renderMessageContent = (content: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlPattern);

    return parts.map((part, i) => {
      if (part.match(urlPattern)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all items-center gap-1 inline-flex"
          >
            <LinkIcon className="h-3 w-3" />
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <Card className="flex min-h-130 h-[72vh] flex-col overflow-hidden rounded-2xl border-border/20 bg-background/50 shadow-2xl backdrop-blur-xl sm:h-150 sm:rounded-3xl">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/10 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-10 sm:w-10">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground sm:text-base">
              Asisten Pencari Data
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini AI Online
            </div>
          </div>
        </div>
        <div className="flex w-fit items-center gap-1.5 rounded-full bg-muted/20 px-3 py-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          Powered by Gemma4
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth sm:space-y-6 sm:p-6"
      >
        {messages.length === 0 && !isSending && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="max-w-xs">
              <p className="font-medium text-foreground">Halo, {user.name}!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tanyakan apa saja untuk menemukan dataset yang kamu butuhkan
                untuk investigasi ini.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`flex max-w-[92%] gap-2.5 sm:max-w-[80%] sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </div>
              <div
                className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed shadow-sm sm:px-4 sm:py-3 sm:text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/80 text-foreground rounded-tl-none border border-border/5"
                }`}
              >
                {renderMessageContent(msg.content)}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="flex max-w-[92%] gap-2.5 sm:max-w-[80%] sm:gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground sm:h-8 sm:w-8">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-none bg-muted/80 px-3 py-2.5 text-xs text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sedang mencari data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/10 bg-background p-3 sm:p-4">
        <form onSubmit={handleSend} className="relative flex gap-2 sm:gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik topik data yang ingin dicari... (contoh: data iklim jakarta)"
            className="h-11 flex-1 rounded-2xl border-border/20 bg-muted/30 pr-12 text-xs focus:ring-primary/20 sm:h-12 sm:text-sm"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSending}
            className="absolute right-1 top-0.5 h-10 w-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 sm:top-1"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <p className="mt-2.5 text-center text-[10px] text-muted-foreground sm:mt-3">
          Saran: Bertanyalah secara spesifik tentang lokasi atau tahun data
          untuk hasil yang lebih akurat.
        </p>
      </div>
    </Card>
  );
}
