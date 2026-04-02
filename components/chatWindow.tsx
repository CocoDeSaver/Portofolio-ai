"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark } from "react-icons/hi2";
import { IoSend } from "react-icons/io5";
import { Message } from "./chatButton";

interface ChatWindowProps {
  onClose: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatWindow({ onClose, messages, setMessages }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [messages, isLoading, streamingText]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    const userMsg: Message = { id: Date.now(), text: userMessageText, sender: "user" };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingText(""); 

    const aiMsgId = Date.now() + 1;
    let localAccumulated = ""; 

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageText }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error("No reader available");

      setMessages((prev) => [...prev, { id: aiMsgId, text: "", sender: "ai" }]);

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        const chunkValue = decoder.decode(value);
        const lines = chunkValue.split("\n");

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === "data: [DONE]") continue;

          if (trimmedLine.startsWith("data: ")) {
            try {
              const jsonStr = trimmedLine.replace("data: ", "");
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                localAccumulated += content;
                setStreamingText(localAccumulated);

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId ? { ...msg, text: localAccumulated } : msg
                  )
                );
              }
            } catch (e) {
              continue; 
            }
          }
        }
      }

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = "Maaf, sepertinya ada masalah koneksi. Coba lagi ya!";
      setMessages((prev) =>
        prev.map((msg) => (msg.id === aiMsgId ? { ...msg, text: errorMsg } : msg))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-0 right-0 sm:bottom-28 sm:right-8 w-full sm:w-95 h-dvh sm:h-137.5 z-60 flex flex-col overflow-hidden bg-white/80 backdrop-blur-2xl border-t sm:border border-white/40 shadow-2xl sm:rounded-3xl"
    >
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/20 bg-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? "bg-amber-500 animate-bounce" : "bg-purple-500 animate-pulse"}`} />
          <p className="font-semibold text-slate-800 text-sm tracking-tight">Nico AI Assistant</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-2 transition-colors hover:bg-black/5 rounded-full">
          <HiXMark size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-linear-to-b from-transparent to-purple-50/30">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-2 max-w-[90%] ${msg.sender === "user" ? "ml-auto" : ""}`}
            >
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm border wrap-break-word
                ${msg.sender === "user" ? "bg-purple-600 text-white rounded-tr-none border-purple-500" : "bg-white/90 text-slate-700 rounded-tl-none border-white/50"}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {isLoading && streamingText === "" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 p-3 bg-white/50 w-16 rounded-2xl rounded-tl-none border border-white/50">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white/40 border-t border-white/20 pb-safe">
        <div className="relative flex items-end gap-2 bg-white/50 border border-white/60 rounded-2xl px-3 py-2 shadow-inner focus-within:ring-2 focus-within:ring-purple-400/30 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={isLoading ? "Nico is thinking..." : "Ask me anything about Nico..."}
            className="flex-1 bg-transparent border-none resize-none py-1 text-sm text-slate-700 focus:outline-none max-h-30 disabled:opacity-50"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading} 
            className="p-2 bg-slate-900 text-white rounded-xl mb-0.5 disabled:bg-slate-400 transition-all active:scale-95"
          >
            <IoSend size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}