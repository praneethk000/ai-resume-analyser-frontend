import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./lib/providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  title: "ResumeAI — Analyse Your Resume with AI",
  description: "Upload your resume, match it against any job description, and get an AI-powered match score with skill gap analysis. Land your dream job faster.",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
