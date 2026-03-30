"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Intro from "@/components/Intro";
import Hero from "@/components/Hero";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      <AnimatePresence mode="wait">
        {showIntro && <Intro key="intro" />}
      </AnimatePresence>

      <Hero />
    </main>
  );
}