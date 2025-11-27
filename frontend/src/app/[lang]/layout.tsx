import type { Metadata } from "next";
import "../globals.css";
import { ApolloProvider } from "@/providers/apollo-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { i18n } from "@/i18n-config";
import { DictionaryProvider } from "@/contexts/dictionary-context";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/lib/dictionary-types";

export const metadata: Metadata = {
  title: "Attendance System - Dochádzkový Systém",
  description:
    "Modern web-based time tracking and workforce management platform",
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ApolloProvider>
            <DictionaryProvider dictionary={dictionary} locale={lang as Locale}>
              <AppLayout lang={lang}>{children}</AppLayout>
            </DictionaryProvider>
          </ApolloProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
