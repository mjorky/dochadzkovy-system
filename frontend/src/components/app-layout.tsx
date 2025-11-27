"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { UnifiedHeader } from "@/components/unified-header";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        {!isLoginPage && <Sidebar />}
        <main
          className={`flex-1 bg-background overflow-y-auto ${isLoginPage ? "w-full" : ""}`}
        >
          {!isLoginPage ? (
            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in-0 duration-500">
              <UnifiedHeader />
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </AuthProvider>
  );
}
