import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeTutor AI — Software Training Platform with AI Tutor",
  description: "Learn AI/ML, Full Stack Java, .NET, Mobile App Development, and Flutter through step-wise lessons, video walkthroughs, graded tests, and a 24/7 AI tutor.",
  keywords: ["AI tutor", "software training", "coding courses", "React Native", "Flutter", "Spring Boot", "ASP.NET", "Machine Learning", "LLM"],
  authors: [{ name: "CodeTutor AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "CodeTutor AI — Software Training Platform",
    description: "Master software engineering with your personal AI tutor. Step-wise lessons, video walkthroughs, graded tests.",
    url: "https://chat.z.ai",
    siteName: "CodeTutor AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeTutor AI — Software Training Platform",
    description: "Master software engineering with your personal AI tutor.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
