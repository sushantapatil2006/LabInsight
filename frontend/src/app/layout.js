import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "LabInsight – Instant Lab Report Analyzer",
  description:
    "AI-powered laboratory report interpretation. Upload your lab report and understand your health instantly with detailed analysis, risk assessment, and personalized recommendations.",
  keywords: ["lab report", "health analysis", "AI", "medical", "blood test"],
  authors: [{ name: "LabInsight" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans antialiased bg-white text-deep-blue">
        {children}
      </body>
    </html>
  );
}
