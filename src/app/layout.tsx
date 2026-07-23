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
  title: "Grow Fit | Grow Strong. Live Better.",
  description: "Grow Fit is a premium fitness community for body transformation, accountability, healthy living, and meaningful connection.",
  metadataBase: new URL('https://gymitupwith.co.ke'),
  openGraph: {
    title: "Grow Fit | Grow Strong. Live Better.",
    description: "A premium fitness community for body transformation, accountability, healthy living, and meaningful connection.",
    url: "https://gymitupwith.co.ke",
    siteName: "Grow Fit",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Grow Fit fitness community",
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
