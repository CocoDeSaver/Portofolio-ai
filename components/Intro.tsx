"use client";

import { motion } from "framer-motion";

export default function Intro() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-white text-4xl font-semibold"
      >
        Hello
      </motion.h1>
    </motion.div>
  );
}