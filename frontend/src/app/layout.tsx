import type { Metadata } from "next";
import "./globals.css";
import { ApolloProvider } from "@/providers/apollo-provider";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Attendance System - Dochádzkový Systém",
  description: "Modern web-based time tracking and workforce management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ApolloProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-background">
              {children}
            </main>
          </div>
        </ApolloProvider>
      </body>
    </html>
  );
}
