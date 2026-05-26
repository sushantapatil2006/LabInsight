"use client";

import { motion } from "framer-motion";
import { Shield, Zap, FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your reports are never stored. All processing happens in temporary memory and data is discarded after analysis.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Get comprehensive results in seconds powered by advanced AI models trained on medical literature.",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description:
      "Receive detailed breakdowns of every lab marker with clear explanations and reference ranges.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Download,
    title: "Export PDF",
    description:
      "Download your complete analysis as a professional PDF report to share with your healthcare provider.",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function FeatureHighlights() {
  return (
    <section className="py-24 bg-section-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-deep-blue mb-4">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
              LabInsight
            </span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Advanced AI technology meets healthcare simplicity. Get the insights
            you need in seconds.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-slate-100 group">
                <CardContent className="p-6 pt-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-deep-blue text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
