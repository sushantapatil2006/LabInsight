"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const steps = [
  { text: "Extracting text from PDF...", icon: "📄" },
  { text: "Parsing lab values...", icon: "🔬" },
  { text: "AI is analyzing your report...", icon: "🤖" },
  { text: "Generating insights...", icon: "💡" },
];

function PulsingDot({ delay = 0 }) {
  return (
    <motion.div
      className="w-2.5 h-2.5 rounded-full bg-teal-500"
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        delay,
      }}
    />
  );
}

function SkeletonBlock({ className }) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

export default function AnalysisLoading() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-hero-gradient">
      <div className="max-w-lg w-full text-center">
        {/* Animated medical cross spinner */}
        <motion.div
          className="w-24 h-24 mx-auto mb-10 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Outer ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            {/* Animated arc */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="283"
              animate={{
                strokeDashoffset: [283, 70, 283],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Medical cross */}
            <motion.g
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <rect
                x="43"
                y="30"
                width="14"
                height="40"
                rx="4"
                fill="#14B8A6"
              />
              <rect
                x="30"
                y="43"
                width="40"
                height="14"
                rx="4"
                fill="#14B8A6"
              />
            </motion.g>
          </svg>
        </motion.div>

        {/* Step text */}
        <motion.div
          className="h-16 flex items-center justify-center mb-6"
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <span className="text-2xl mr-3">{steps[currentStep].icon}</span>
          <p className="text-lg font-medium text-deep-blue">
            {steps[currentStep].text}
          </p>
        </motion.div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStep
                  ? "w-8 bg-teal-500"
                  : idx < currentStep
                  ? "w-4 bg-teal-300"
                  : "w-4 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Pulsing dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <PulsingDot delay={0} />
          <PulsingDot delay={0.2} />
          <PulsingDot delay={0.4} />
        </div>

        {/* Skeleton preview */}
        <motion.div
          className="mt-16 space-y-4 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
        >
          <SkeletonBlock className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </div>
          <SkeletonBlock className="h-40 w-full" />
        </motion.div>
      </div>
    </div>
  );
}
