"use client";

import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SummaryCard from "@/components/SummaryCard";
import AbnormalTable from "@/components/AbnormalTable";
import InsightsPanel from "@/components/InsightsPanel";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ResultsDashboard({ analysisData, onReset, onDownload }) {
  const data = analysisData || {};

  return (
    <div className="min-h-screen bg-section-gradient py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with actions */}
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-deep-blue">
              Analysis Results
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Your lab report has been analyzed by AI
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
              Analyze Another
            </Button>
            <Button size="sm" onClick={onDownload}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </motion.div>

        {/* Results grid */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Summary */}
          <SummaryCard data={data} />

          {/* Key Insights */}
          <InsightsPanel data={data} />

          {/* Lab values table */}
          <AbnormalTable data={data} />

          {/* Recommendations */}
          <RecommendationsPanel data={data} />

          {/* Disclaimer */}
          <DisclaimerBanner />
        </motion.div>

        {/* Bottom actions */}
        <motion.div
          className="flex justify-center gap-4 mt-10 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
            Start Over
          </Button>
          <Button variant="secondary" onClick={onDownload}>
            <Download className="w-4 h-4" />
            Export Report as PDF
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
