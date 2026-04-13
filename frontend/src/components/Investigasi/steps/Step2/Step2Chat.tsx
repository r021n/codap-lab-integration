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
    <Card className="flex flex-col h-[600px] border-border/20 bg-background/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-primary/5 border-b border-border/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-foreground">
              Asisten Pencari Data
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini AI Online
            </div>
          </div>
        </div>
        <div className="text-muted-foreground bg-muted/20 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          Powered by Gemma4
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
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
              className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
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
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted text-foreground">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-muted/80 text-muted-foreground rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sedang mencari data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border/10">
        <form onSubmit={handleSend} className="flex gap-3 relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik topik data yang ingin dicari... (contoh: data iklim jakarta)"
            className="flex-1 rounded-2xl bg-muted/30 border-border/20 h-12 pr-12 focus:ring-primary/20"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSending}
            className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-3">
          Saran: Bertanyalah secara spesifik tentang lokasi atau tahun data
          untuk hasil yang lebih akurat.
        </p>
      </div>
    </Card>
  );
}
