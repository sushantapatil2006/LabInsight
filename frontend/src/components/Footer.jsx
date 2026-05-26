"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      className="py-10 border-t border-slate-100 bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo / brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-deep-blue text-lg">
              Lab
              <span className="text-teal-500">Insight</span>
            </span>
          </div>

          {/* Center text */}
          <p className="text-sm text-slate-400 text-center">
            Built with AI • Your data is never stored •{" "}
            <span className="text-slate-500">Privacy first, always</span>
          </p>

          {/* Copyright */}
          <p className="text-xs text-slate-300">
            © {new Date().getFullYear()} LabInsight
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
