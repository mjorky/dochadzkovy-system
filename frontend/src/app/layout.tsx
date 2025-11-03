import type { Metadata } from "next";
import "./globals.css";
import { ApolloProvider } from "@/providers/apollo-provider";

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
          {children}
        </ApolloProvider>
      </body>
    </html>
  );
}
