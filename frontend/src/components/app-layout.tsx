"use client"

import { AuthProvider } from "@/providers/auth-provider"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        {!isLoginPage && <Sidebar />}
        <main className={`flex-1 bg-background overflow-y-auto ${isLoginPage ? 'w-full' : ''}`}>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}

