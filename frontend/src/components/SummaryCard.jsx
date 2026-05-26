"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusConfig = {
  healthy: {
    variant: "healthy",
    label: "Healthy",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-700",
    iconClass: "text-emerald-500",
  },
  "mild concern": {
    variant: "warning",
    label: "Mild Concern",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    textClass: "text-amber-700",
    iconClass: "text-amber-500",
  },
  "needs attention": {
    variant: "danger",
    label: "Needs Attention",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    textClass: "text-orange-700",
    iconClass: "text-orange-500",
  },
  critical: {
    variant: "critical",
    label: "Critical",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    textClass: "text-red-700",
    iconClass: "text-red-500",
  },
};

function getStatusConfig(status) {
  const key = (status || "healthy").toLowerCase();
  return statusConfig[key] || statusConfig["healthy"];
}

export default function SummaryCard({ data }) {
  const overallStatus = data?.overall_status || data?.overallStatus || "Healthy";
  const summary = data?.summary || data?.overall_summary || "";
  const patientName = data?.patient_info?.name || data?.patientInfo?.name || null;
  const labName = data?.patient_info?.lab || data?.patientInfo?.lab || null;
  const reportDate = data?.patient_info?.date || data?.patientInfo?.date || null;
  const config = getStatusConfig(overallStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`${config.bgClass} border ${config.borderClass} overflow-hidden`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl ${config.bgClass} border ${config.borderClass} flex items-center justify-center`}
              >
                <Activity className={`w-6 h-6 ${config.iconClass}`} />
              </div>
              <div>
                <CardTitle className="text-xl">Overall Health Status</CardTitle>
                {patientName && (
                  <p className="text-sm text-slate-500 mt-0.5">{patientName}</p>
                )}
              </div>
            </div>
            <Badge variant={config.variant} className="text-sm px-4 py-1.5">
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 leading-relaxed">{summary}</p>

          {/* Patient / lab info */}
          {(labName || reportDate) && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-200/50">
              {labName && (
                <div className="text-sm">
                  <span className="text-slate-400">Lab: </span>
                  <span className="text-slate-600 font-medium">{labName}</span>
                </div>
              )}
              {reportDate && (
                <div className="text-sm">
                  <span className="text-slate-400">Date: </span>
                  <span className="text-slate-600 font-medium">
                    {reportDate}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
