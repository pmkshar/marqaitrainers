import type { Metadata, Viewport } from "next";
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
  title: "MarqAI Courses — AI-Powered Online Learning Platform",
  description: "MarqAI Courses — Learn AI/ML, Full Stack Java, .NET, Mobile, and Flutter with AI voice tutor, step-wise lessons, video walkthroughs, graded tests, and verified certificates. Corporate training with custom course curation.",
  keywords: ["MarqAI Courses", "online courses", "AI tutor", "AI voice tutor", "corporate training", "verified certificates", "React Native", "Flutter", "Spring Boot", "ASP.NET", "Machine Learning", "skill development"],
  authors: [{ name: "MarqAI Tech Pvt Ltd" }],
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "MarqAI Courses",
    statusBarStyle: "default",
  },
  applicationName: "MarqAI Courses — AI-Powered Learning",
  openGraph: {
    title: "MarqAI Courses — AI-Powered Online Learning Platform",
    description: "AI voice tutor + verified certificates · step-wise lessons · video walkthroughs · graded tests · corporate training with custom course curation.",
    url: "https://marqaicourses.com",
    siteName: "MarqAI Courses",
    type: "website",
    images: [
      { url: "/marqai-logo.svg", width: 512, height: 512, type: "image/svg+xml" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarqAI Courses — AI-Powered Learning",
    description: "AI voice tutor + verified certificates · step-wise lessons · graded tests · corporate training.",
    images: ["/marqai-logo.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
