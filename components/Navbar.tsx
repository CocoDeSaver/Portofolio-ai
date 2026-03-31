"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-xs">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex item-ceter">
          <img src="/logo/black_logo.svg" alt="Logo" className="w-10 h-10 object-contain mix-blend-color-burn"/>
        </div>
        
        <div className="flex gap-1 relative" onMouseLeave={() => setHovered(null)}>
          {["Home", "Projects", "About", "Contact"].map((item) => (
            <button key={item} onMouseEnter={() => setHovered(item)} className="relative px-4 py-2 text-sm text-black transition-colors duration-300 z-10">
                <span className="relative z-20 text-base font-light">{item}</span>
                {hovered === item && (
                    <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-black/5 rounded-full z-10"
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                    }}/>
                )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}