import type { Metadata } from "next";
import "./globals.css";
import { ApolloProvider } from "@/providers/apollo-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/app-layout";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ApolloProvider>
             <AppLayout>{children}</AppLayout>
          </ApolloProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
