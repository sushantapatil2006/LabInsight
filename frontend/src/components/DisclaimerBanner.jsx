"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-xl border border-amber-200 bg-amber-50/50 p-5"
    >
      <div className="flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Medical Disclaimer
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            This AI-generated analysis is for informational purposes only and is
            not a substitute for professional medical advice, diagnosis, or
            treatment. Always seek the advice of your physician or other
            qualified health provider with any questions you may have regarding a
            medical condition.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
