// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayout from "@/components/Layout/ClientLayout";
import { PageTitleProvider } from "@/context/PageTitleContext";
import Notifications from "@/components/Notifications";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MedAI Dashboard",
  description: "Healthcare Analytics Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <PageTitleProvider>
          <AuthProvider>
            <ClientLayout>
              <Notifications />
              {children}
            </ClientLayout>
          </AuthProvider>
        </PageTitleProvider>
      </body>
    </html>
  );
}
