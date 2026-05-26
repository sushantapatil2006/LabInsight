"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { uploadAndAnalyze, generatePdf, resetSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import FeatureHighlights from "@/components/FeatureHighlights";
import UploadSection from "@/components/UploadSection";
import AnalysisLoading from "@/components/AnalysisLoading";
import ResultsDashboard from "@/components/ResultsDashboard";
import Footer from "@/components/Footer";

export default function Home() {
  const [appState, setAppState] = useState("landing"); // landing | analyzing | results | error
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  const handleGetStarted = useCallback(() => {
    const uploadSection = document.getElementById("upload-section");
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleAnalyze = useCallback(async (file) => {
    setAppState("analyzing");
    setError(null);

    try {
      const result = await uploadAndAnalyze(file);
      setAnalysisData(result);
      setAppState("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setAppState("error");
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!analysisData) return;

    try {
      const blob = await generatePdf(analysisData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "LabInsight-Report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Failed to download PDF. Please try again.");
    }
  }, [analysisData]);

  const handleReset = useCallback(async () => {
    await resetSession();
    setAnalysisData(null);
    setError(null);
    setAppState("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <AnimatePresence mode="wait">
        {appState === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection onGetStarted={handleGetStarted} />
            <FeatureHighlights />
            <UploadSection onAnalyze={handleAnalyze} />
            <Footer />
          </motion.div>
        )}

        {appState === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalysisLoading />
          </motion.div>
        )}

        {appState === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsDashboard
              analysisData={analysisData}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          </motion.div>
        )}

        {appState === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex items-center justify-center px-4 bg-hero-gradient"
          >
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-deep-blue mb-2">
                  Analysis Failed
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {error}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleReset}>
                    Go Back
                  </Button>
                  <Button
                    onClick={() => {
                      setAppState("landing");
                      setError(null);
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
