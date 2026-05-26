"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusVariantMap = {
  normal: "healthy",
  low: "warning",
  high: "danger",
  critical: "critical",
};

function getStatusVariant(status) {
  return statusVariantMap[(status || "normal").toLowerCase()] || "default";
}

function LabValueRow({ marker, index }) {
  const [expanded, setExpanded] = useState(false);
  const status = (marker.status || "normal").toLowerCase();
  const variant = getStatusVariant(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left cursor-pointer"
      >
        <div
          className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors ${
            expanded ? "bg-slate-50" : ""
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-deep-blue text-sm truncate">
              {marker.test_name || marker.testName || marker.name}
            </p>
          </div>
          <div className="text-right flex-shrink-0 w-24">
            <p className="font-semibold text-deep-blue text-sm">
              {marker.value || marker.measured_value}
              {marker.unit ? (
                <span className="text-slate-400 font-normal ml-1 text-xs">
                  {marker.unit}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex-shrink-0 w-32 text-right hidden sm:block">
            <p className="text-xs text-slate-400">
              {marker.reference_range || marker.referenceRange || "—"}
            </p>
          </div>
          <div className="flex-shrink-0 w-24 text-right">
            <Badge variant={variant} className="text-[11px]">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (marker.explanation || marker.description) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 ml-4 border-l-2 border-teal-200">
              <p className="text-sm text-slate-500 leading-relaxed">
                {marker.explanation || marker.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AbnormalTable({ data }) {
  const labValues = data?.lab_values || data?.labValues || [];
  const abnormalMarkers =
    data?.abnormal_markers || data?.abnormalMarkers || [];

  // Combine and deduplicate
  const allMarkers = labValues.length > 0 ? labValues : abnormalMarkers;

  if (allMarkers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-12 text-center">
            <PartyPopper className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-deep-blue mb-2">
              All markers within normal range!
            </h3>
            <p className="text-slate-400">
              Great news — your lab values look good.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Separate normal and abnormal
  const abnormal = allMarkers.filter(
    (m) => (m.status || "normal").toLowerCase() !== "normal"
  );
  const normal = allMarkers.filter(
    (m) => (m.status || "normal").toLowerCase() === "normal"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Abnormal markers */}
      {abnormal.length > 0 && (
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Flagged Markers
              <span className="text-sm font-normal text-slate-400 ml-2">
                ({abnormal.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table header */}
            <div className="flex items-center gap-4 px-4 pb-2 border-b border-slate-100 mb-1">
              <div className="flex-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Test Name
              </div>
              <div className="w-24 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Value
              </div>
              <div className="w-32 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:block">
                Reference
              </div>
              <div className="w-24 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </div>
              <div className="w-4" />
            </div>

            <div className="divide-y divide-slate-50">
              {abnormal.map((marker, idx) => (
                <LabValueRow
                  key={marker.test_name || marker.testName || marker.name || idx}
                  marker={marker}
                  index={idx}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All markers */}
      {normal.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Normal Markers
              <span className="text-sm font-normal text-slate-400 ml-2">
                ({normal.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 px-4 pb-2 border-b border-slate-100 mb-1">
              <div className="flex-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                Test Name
              </div>
              <div className="w-24 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Value
              </div>
              <div className="w-32 text-right text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:block">
                Reference
              </div>
              <div className="w-24 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </div>
              <div className="w-4" />
            </div>

            <div className="divide-y divide-slate-50">
              {normal.map((marker, idx) => (
                <LabValueRow
                  key={marker.test_name || marker.testName || marker.name || idx}
                  marker={marker}
                  index={idx}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
