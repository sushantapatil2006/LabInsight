"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getRiskLabel(score) {
  if (score <= 30) return "Low Risk";
  if (score <= 50) return "Moderate Risk";
  if (score <= 70) return "High Risk";
  return "Critical Risk";
}

function getRiskColor(score) {
  if (score <= 30) return "#22c55e";
  if (score <= 50) return "#eab308";
  if (score <= 70) return "#f97316";
  return "#ef4444";
}

function getRiskBg(score) {
  if (score <= 30) return "bg-emerald-50 text-emerald-700";
  if (score <= 50) return "bg-amber-50 text-amber-700";
  if (score <= 70) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

export default function RiskMeter({ data }) {
  const score = data?.risk_assessment?.score ?? data?.risk_score ?? data?.riskScore ?? 25;
  const description = data?.risk_assessment?.description || data?.risk_description || data?.riskDescription || "";
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // SVG parameters for semi-circle gauge
  const cx = 150;
  const cy = 140;
  const r = 110;
  const startAngle = Math.PI; // 180 degrees (left)
  const endAngle = 0; // 0 degrees (right)
  const totalAngle = Math.PI;

  // Arc path for background
  const bgArcStartX = cx + r * Math.cos(startAngle);
  const bgArcStartY = cy - r * Math.sin(startAngle);
  const bgArcEndX = cx + r * Math.cos(endAngle);
  const bgArcEndY = cy - r * Math.sin(endAngle);

  // Calculate filled arc based on score
  const scoreAngle = startAngle - (animatedScore / 100) * totalAngle;
  const filledEndX = cx + r * Math.cos(scoreAngle);
  const filledEndY = cy - r * Math.sin(scoreAngle);

  const bgPath = `M ${bgArcStartX} ${bgArcStartY} A ${r} ${r} 0 0 1 ${bgArcEndX} ${bgArcEndY}`;
  const filledPath = `M ${bgArcStartX} ${bgArcStartY} A ${r} ${r} 0 0 1 ${filledEndX} ${filledEndY}`;

  // Gradient stops for the colored sections
  const gradientId = "risk-gradient";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getRiskColor(score) }} />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 300 180" className="w-full max-w-xs">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="33%" stopColor="#eab308" />
                  <stop offset="66%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Background arc */}
              <path
                d={bgPath}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="18"
                strokeLinecap="round"
              />

              {/* Filled arc */}
              {animatedScore > 0 && (
                <path
                  d={filledPath}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="18"
                  strokeLinecap="round"
                />
              )}

              {/* Score text */}
              <text
                x={cx}
                y={cy - 10}
                textAnchor="middle"
                className="fill-deep-blue"
                style={{ fontSize: "42px", fontWeight: 800 }}
              >
                {animatedScore}
              </text>
              <text
                x={cx}
                y={cy + 16}
                textAnchor="middle"
                style={{ fontSize: "13px", fontWeight: 500 }}
                className="fill-slate-400"
              >
                / 100
              </text>

              {/* Min/Max labels */}
              <text
                x="30"
                y="165"
                style={{ fontSize: "11px" }}
                className="fill-slate-400"
              >
                0
              </text>
              <text
                x="262"
                y="165"
                style={{ fontSize: "11px" }}
                className="fill-slate-400"
              >
                100
              </text>
            </svg>

            <div
              className={`mt-2 px-4 py-1.5 rounded-full text-sm font-semibold ${getRiskBg(
                score
              )}`}
            >
              {getRiskLabel(score)}
            </div>

            {description && (
              <p className="text-sm text-slate-500 text-center mt-4 leading-relaxed max-w-sm">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
