"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "@/components/chatWindow";
import { HiSparkles } from "react-icons/hi2";

export interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

const tipMessages = [
  "Deep dive into Nico's tech stack",
  "Ask about recent AI projects",
  "Explore full-stack expertise",
  "Available for new opportunities"
];

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [index, setIndex] = useState(0);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("nico_chat_history");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ id: 1, text: "👋 Hi! I'm Nico's AI. Ask me about his tech stack, projects, or experience!", sender: "ai" }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("nico_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => (prev + 1) % tipMessages.length), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showTip && !open && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ 
              duration: 0.6, 
              ease: [0.2, 0.8, 0.2, 1]
            }}
            className="fixed bottom-24 right-8 z-50 pointer-events-none flex flex-col items-end"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full" />
              
              <div className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl shadow-2xl shadow-purple-500/10">
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold bg-linear-to-r from-slate-600 via-purple-600 to-slate-600 bg-clip-text text-transparent">
                  {tipMessages[index]}
                </span>
                <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
              </div>

              <div className="mr-6 mt-px w-3 h-3 bg-white/10 backdrop-blur-md border-r border-b border-white/20 rotate-45 self-end" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        dragElastic={0.5}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9, cursor: "grabbing" }}
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl touch-none
          ${open ? 'bg-slate-900 text-white' : 'bg-white/40 backdrop-blur-xl border border-white/40 shadow-purple-500/20'}`}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} className="text-2xl font-light block">×</motion.span>
          ) : (
            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-400 blur-xl opacity-50 animate-pulse" />
              <HiSparkles className="relative text-2xl text-purple-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <ChatWindow 
            onClose={() => setOpen(false)} 
            messages={messages} 
            setMessages={setMessages} 
          />
        )}
      </AnimatePresence>
    </>
  );
}