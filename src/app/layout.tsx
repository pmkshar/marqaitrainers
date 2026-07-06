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
  title: "marqaicourses — Online Courses Platform (AI + Human Tutors, RBAC Admin)",
  description: "marqaicourses Online Courses Platform — learn AI/ML, Full Stack Java, .NET, Mobile, and Flutter with step-wise lessons, video walkthroughs, graded tests, a 24/7 AI tutor, and vetted human tutors. Super Admin portal with full RBAC.",
  keywords: ["marqaicourses", "online courses", "AI tutor", "human tutors", "RBAC", "Super Admin", "subscriptions", "React Native", "Flutter", "Spring Boot", "ASP.NET", "Machine Learning"],
  authors: [{ name: "marqaicourses" }],
  icons: {
    icon: [
      { url: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/icon-192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "marqaicourses",
    statusBarStyle: "default",
  },
  applicationName: "marqaicourses Online Courses Platform",
  openGraph: {
    title: "marqaicourses — Online Courses Platform",
    description: "AI + Human tutors · step-wise lessons · video walkthroughs · graded tests · Super Admin portal with RBAC.",
    url: "https://chat.z.ai",
    siteName: "marqaicourses",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "marqaicourses — Online Courses Platform",
    description: "AI + Human tutors · step-wise lessons · graded tests · Super Admin portal.",
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
