"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import DailyPopup from "@/components/DailyPopup";
import JoinModal from "@/components/JoinModal";
import QuickChatButton from "@/components/QuickChatButton";
import ScrollToTop from "@/components/ScrollToTop";
import type React from "react";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow ${isAdminRoute ? '' : 'pt-24'}`}>{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <QuickChatButton />}
      {!isAdminRoute && <ScrollToTop />}
      {!isAdminRoute && <ChatWidget />}
      {!isAdminRoute && <DailyPopup />}
      <JoinModal />
    </>
  );
}
