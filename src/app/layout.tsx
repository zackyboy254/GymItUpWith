import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { JoinModalProvider } from "@/context/JoinModalContext";
import { ThemeProvider } from "@/context/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gymitupwith Billy | Professional Fitness Coach & Trainer 🏋️‍♂️",
  description: "Empower your fitness journey with personalized coaching, workout routines, group bootcamps, and healthy lifestyle guidance. Guided by Coach Billy.",
  metadataBase: new URL('https://gymitupwith.co.ke'),
  openGraph: {
    title: "Gymitupwith Billy | Professional Fitness Coach & Trainer 🏋️‍♂️",
    description: "Empower your fitness journey with personalized coaching, workout routines, group bootcamps, and healthy lifestyle guidance. Guided by Coach Billy.",
    url: "https://gymitupwith.co.ke",
    siteName: "Gymitupwith Billy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gymitupwith Billy Fitness Coach",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <JoinModalProvider>
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </JoinModalProvider>
      </body>
    </html>
  );
}
