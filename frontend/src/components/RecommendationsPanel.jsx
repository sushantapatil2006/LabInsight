"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clipboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const categoryConfig = {
  lifestyle: { label: "Lifestyle" },
  diet: { label: "Diet" },
  hydration: { label: "Hydration" },
  exercise: { label: "Exercise" },
  "follow-up": { label: "Follow-up Tests" },
  "follow-up tests": { label: "Follow-up Tests" },
  followup: { label: "Follow-up Tests" },
  consultation: { label: "Doctor Consultation" },
  "doctor consultation": { label: "Doctor Consultation" },
  doctor: { label: "Doctor Consultation" },
  medication: { label: "Medication" },
  sleep: { label: "Sleep" },
  stress: { label: "Stress Management" },
  general: { label: "General" },
};

const priorityColors = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

function getCategoryConfig(category) {
  const key = (category || "general").toLowerCase();
  return categoryConfig[key] || categoryConfig["general"];
}

export default function RecommendationsPanel({ data }) {
  const recommendations =
    data?.recommendations || data?.actions || [];

  if (!recommendations.length) return null;

  // Group recommendations by category
  const grouped = {};
  recommendations.forEach((rec) => {
    const cat =
      (rec.category || rec.type || "general").toLowerCase();
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(rec);
  });

  // If recommendations are simple strings, render flat
  const isSimple = recommendations.every((r) => typeof r === "string");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clipboard className="w-5 h-5 text-teal-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isSimple ? (
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="flex items-start gap-3 group"
                >
                  <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5 group-hover:text-teal-600 transition-colors" />
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {rec}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, recs], groupIdx) => {
                const config = getCategoryConfig(cat);
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * groupIdx }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-semibold text-deep-blue text-sm">
                        {config.label}
                      </h4>
                    </div>
                    <div className="space-y-2.5 ml-7">
                      {recs.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 group"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5 group-hover:text-teal-600 transition-colors" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {rec.text || rec.description || rec.action || (typeof rec === "string" ? rec : JSON.stringify(rec))}
                            </p>
                          </div>
                          {rec.priority !== undefined && (
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                                typeof rec.priority === 'number'
                                  ? (rec.priority <= 2 ? priorityColors.high : rec.priority === 3 ? priorityColors.medium : priorityColors.low)
                                  : (priorityColors[String(rec.priority).toLowerCase()] || priorityColors.medium)
                              }`}
                              title={`Priority: ${rec.priority}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
