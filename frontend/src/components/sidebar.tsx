"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Database, 
  Clock, 
  FolderKanban, 
  FileText, 
  Settings, 
  CalendarCheck, 
  ChevronDown, 
  ChevronUp, // Pridaná šípka hore pre settings
  LucideIcon, 
  LogOut,
  FileBarChart, 
  ListTodo,     
  Languages     
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/providers/auth-provider"

interface SubMenuItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  submenu?: SubMenuItem[];
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { name: "Work Records", href: "/work-records", icon: CalendarCheck },
  { name: "Data", href: "/data", icon: Database },
  { name: "Overtime", href: "/overtime", icon: Clock },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
    submenu: [
      { name: "Work Report", href: "/reports/work-report", icon: FileBarChart },
      { name: "Work List", href: "/reports/work-list", icon: ListTodo },
    ],
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings, 
    adminOnly: true,
    submenu: [
      { name: "Employees", href: "/admin/employees", icon: Users },
      { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  
  // Nový stav pre Settings panel dole
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const [language, setLanguage] = useState<"en" | "sk">("en") 
  const { user, logout } = useAuth()

  const handleMenuClick = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "sk" : "en"))
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* HEADER */}
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sidebar-foreground">Attendance System</h1>
      </div>

      {/* NAVIGÁCIA */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && !user?.isAdmin) {
              return null
            }

            const isActive =
              pathname === item.href || (item.submenu && item.submenu.some((sub) => pathname === sub.href))
            const Icon = item.icon
            const isExpanded = expandedMenu === item.name

            return (
              <li key={item.href}>
                {item.submenu ? (
                  <div>
                    <Button
                      onClick={() => handleMenuClick(item.name)}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-between gap-3",
                        isActive &&
                        "bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90",
                        !isActive &&
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                    </Button>

                    {isExpanded && (
                      <ul className="space-y-1 mt-2 ml-4">
                        {item.submenu.map((subitem) => {
                          const isSubActive = pathname === subitem.href
                          const SubIcon = subitem.icon

                          return (
                            <li key={subitem.href}>
                              <Button
                                variant={isSubActive ? "secondary" : "ghost"}
                                className={cn(
                                  "w-full justify-start gap-3 text-sm",
                                  isSubActive &&
                                  "bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90",
                                  !isSubActive &&
                                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                )}
                                asChild
                              >
                                <Link href={subitem.href}>
                                  <span className="flex items-center gap-3">
                                    {SubIcon && <SubIcon className="h-4 w-4" />}
                                    <span>{subitem.name}</span>
                                  </span>
                                </Link>
                              </Button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive &&
                      "bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90",
                      !isActive &&
                      "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 space-y-2">
         
         {/* Settings Toggle Button */}
         <Button 
            variant="ghost" 
            className="w-full justify-between hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
         >
            <span className="flex items-center gap-3">
               <Settings className="h-5 w-5" />
               <span>Settings</span>
            </span>
            {/* Šípka sa otáča podľa stavu */}
            {isSettingsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
         </Button>

         {/* Collapsible Settings Area */}
         {isSettingsOpen && (
             <div className="p-2 bg-sidebar-accent/50 rounded-md space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Language</span>
                   <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={toggleLanguage}
                      className="h-8 w-16 gap-2"
                   >
                      <Languages className="h-3 w-3" />
                      {language.toUpperCase()}
                   </Button>
                </div>
                
                <div className="flex items-center justify-between">
                   <span className="text-sm font-medium">Appearance</span>
                   <ModeToggle />
                </div>
             </div>
         )}

         {/* User Info & Logout */}
         <div className="pt-2 mt-2 border-t border-sidebar-border/50">
            {user && (
                <div className="mb-2 px-2 py-1 text-sm text-muted-foreground truncate">
                  <div className="text-xs opacity-70">Logged in as:</div>
                  <div className="font-semibold text-foreground truncate" title={user.username}>{user.username}</div>
                </div>
            )}
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
            </Button>
         </div>
      </div>
    </aside>
  )
}