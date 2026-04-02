"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import ChatButton from "@/components/chatButton";
import { useState, useEffect } from "react";
import { AnimatePresence} from "framer-motion";

export default function Home() {
  const [showIntro, SetShowIntro] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      SetShowIntro(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative">
      <AnimatePresence mode="wait">
        {showIntro && <Intro key="intro" />} 
      </AnimatePresence>
      {!showIntro && (
          <>
            <ChatButton />
            <Navbar />
            <Hero />
          </>
      )}
    </main>
  );
}