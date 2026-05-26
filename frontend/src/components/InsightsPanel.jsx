"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InsightsPanel({ data }) {
  const concerns =
    data?.health_concerns || data?.healthConcerns || data?.insights || [];

  if (!concerns.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {concerns.map((concern, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex gap-3 p-4 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  {(concern.area || concern.title) && (
                    <p className="font-semibold text-deep-blue text-sm mb-1">
                      {concern.area || concern.title}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {concern.description || concern.detail || concern.text || (typeof concern === "string" ? concern : "")}
                  </p>
                  {concern.related_markers && concern.related_markers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {concern.related_markers.map((marker, mIdx) => (
                        <Badge key={mIdx} variant="info" className="text-[10px]">
                          {marker}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {concern.relatedMarkers && concern.relatedMarkers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {concern.relatedMarkers.map((marker, mIdx) => (
                        <Badge key={mIdx} variant="info" className="text-[10px]">
                          {marker}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
