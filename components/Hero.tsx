"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";
import heroAnimation from "@/public/lottie/hero.json";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";


export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-white text-black overflow-hidden">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 z-20">
        <a href="https://github.com/CocoDeSaver" target="_blank" className="text-gray-500 hover:text-black transition">
          <FaGithub size={20} />
        </a>

        <a href="https://linkedin.com/in/nicolasradita" target="_blank" className="text-gray-500 hover:text-black transition">
          <FaLinkedin size={20} />
        </a>

        <a href="#" target="_blank" className="text-gray-500 hover:text-black transition">
          <FaEnvelope size={20} />
        </a>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-0 opacity-50">
        <div className="w-[1200px] md:w-[1700px]">
          <Lottie animationData={heroAnimation} loop/>
        </div>
      </div>

      <div className="text-center max-w-6xl md:max-w-8xl px-4">

        <p className="text-xl md:text-2xl font-extralight">
          Hi! I'm Nico
        </p>
        <h1 className="text-5xl md:text-8xl md:text-7xl font-light">
          AI Engineer 
        </h1>
        <h1 className="text-5xl md:text-8xl font-light">
          Full Stack Developer
        </h1>

        <p className="mt-4 text-gray-500 text-sm md:text-base">
          Building intelligent AI systems and modern web applications.
          Specializing in NLP, RAG pipelines, and scalable backend systems.
        </p>
      </div>

      <motion.div 
      animate={{ y: [0, 8, 0] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      className="absolute bottom-6 text-gray-400 text-base">
        ↓ Scroll
      </motion.div>

    </section>
  );
}