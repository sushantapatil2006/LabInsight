"use client";

import { motion } from "framer-motion";
import { ArrowDown, Shield, Zap, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated DNA Helix SVG
function DNAHelix() {
  return (
    <motion.svg
      viewBox="0 0 200 400"
      className="w-48 h-96 md:w-64 md:h-[28rem]"
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Left strand */}
      <motion.path
        d="M60,20 Q100,60 60,100 Q20,140 60,180 Q100,220 60,260 Q20,300 60,340 Q100,380 60,400"
        fill="none"
        stroke="#14B8A6"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {/* Right strand */}
      <motion.path
        d="M140,20 Q100,60 140,100 Q180,140 140,180 Q100,220 140,260 Q180,300 140,340 Q100,380 140,400"
        fill="none"
        stroke="#0F2B46"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeInOut" }}
      />
      {/* Cross bridges with staggered animation */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => {
        const t = (y - 20) / 380;
        const leftX = 60 + 40 * Math.sin(t * Math.PI * 4);
        const rightX = 140 - 40 * Math.sin(t * Math.PI * 4);
        return (
          <motion.line
            key={i}
            x1={leftX}
            y1={y}
            x2={rightX}
            y2={y}
            stroke={i % 2 === 0 ? "#2DD4BF" : "#0D9488"}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 0.6 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
          />
        );
      })}
      {/* Nucleotide dots */}
      {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => {
        const t = (y - 20) / 380;
        const leftX = 60 + 40 * Math.sin(t * Math.PI * 4);
        const rightX = 140 - 40 * Math.sin(t * Math.PI * 4);
        return (
          <g key={`dots-${i}`}>
            <motion.circle
              cx={leftX}
              cy={y}
              r="4"
              fill="#14B8A6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
            />
            <motion.circle
              cx={rightX}
              cy={y}
              r="4"
              fill="#0F2B46"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
            />
          </g>
        );
      })}
      {/* Floating particles */}
      {[
        { cx: 30, cy: 50, r: 2, delay: 0 },
        { cx: 170, cy: 90, r: 1.5, delay: 1 },
        { cx: 25, cy: 200, r: 2.5, delay: 2 },
        { cx: 175, cy: 280, r: 2, delay: 0.5 },
        { cx: 40, cy: 350, r: 1.5, delay: 1.5 },
        { cx: 160, cy: 370, r: 2, delay: 3 },
      ].map((p, i) => (
        <motion.circle
          key={`particle-${i}`}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill="#14B8A6"
          animate={{
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </motion.svg>
  );
}

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-medium border border-teal-200 mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                AI-Powered Health Analysis
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-deep-blue leading-[1.1] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            >
              Upload Your Lab Report.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                Understand Your Health
              </span>{" "}
              Instantly.
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              AI-powered laboratory report interpretation in seconds. Get
              detailed analysis, risk assessment, and personalized
              recommendations.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            >
              <Button size="lg" onClick={onGetStarted} className="text-base">
                Analyze Report
                <ArrowDown className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap gap-6 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { icon: Shield, text: "No Data Stored" },
                { icon: Zap, text: "Instant Results" },
                { icon: Bot, text: "AI-Powered" },
              ].map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-2 text-sm text-slate-500"
                >
                  <badge.icon className="w-4 h-4 text-teal-500" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right illustration */}
          <motion.div
            className="hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Glow effect behind DNA */}
              <div className="absolute inset-0 bg-gradient-to-b from-teal-400/10 via-transparent to-transparent rounded-full blur-2xl scale-150" />
              <DNAHelix />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Medical disclaimer */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          For informational purposes only. Not a substitute for professional
          medical advice, diagnosis, or treatment.
        </p>
      </motion.div>
    </section>
  );
}
