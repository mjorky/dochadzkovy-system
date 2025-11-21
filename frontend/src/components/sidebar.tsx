"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Database, Clock, FolderKanban, FileText, Settings, CalendarCheck, ChevronDown, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Definícia štruktúry pre podmenu položky
interface SubMenuItem {
  name: string;
  href: string;
  icon?: LucideIcon; // Ikona je voliteľná
}

// Definícia štruktúry pre hlavné menu položky
interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  submenu?: SubMenuItem[];
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
      { name: "Work Report", href: "/reports/work-report", icon: FileText },
      { name: "Work List", href: "/reports/work-list", icon: FileText },
    ],
  },
  {
    name: "Admin",
    href: "/admin",
    icon: Settings,
    submenu: [
      // Tu je definovaná ikona Users
      { name: "Employees", href: "/admin/employees", icon: Users },
      { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)

  const handleMenuClick = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName)
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sidebar-foreground">Attendance System</h1>
        <ModeToggle />
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
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
                                  {/* Vykreslenie ikony pre podpoložku */}
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
    </aside>
  )
}