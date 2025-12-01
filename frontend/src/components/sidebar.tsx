"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Database,
  Clock,
  FolderKanban,
  FileText,
  Settings,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  LucideIcon,
  LogOut,
  FileBarChart,
  ListTodo,
  Languages,
  Banknote,
  CheckSquare, // NOVÁ IKONA: Pre Approvals
  FileQuestion, // NOVÁ IKONA: Pre Requests
  CalendarDays, // NOVÁ IKONA: Pre Holidays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";
import { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Locale } from "@/i18n-config";
import { useQuery } from "@apollo/client/react";
import { GET_PENDING_APPROVAL_COUNT } from "@/graphql/queries/approval-requests";
import { Badge } from "@/components/ui/badge";

interface SubMenuItem {
  key: string;
  href: string;
  icon?: LucideIcon;
}
interface MenuItem {
  key: string;
  href: string;
  icon: LucideIcon;
  submenu?: SubMenuItem[];
  adminOnly?: boolean;
}
interface SidebarProps {
  lang: string;
}

// 1. Doplnenie kľúčov do Interface Dictionary
interface Dictionary {
  sidebar: {
    title: string;
    workRecords: string;
    myBalances: string;
    data: string;
    overtime: string;
    reports: string;
    workReport: string;
    workList: string;
    admin: string;
    employees: string;
    projects: string;
    settings: string;
    language: string;
    appearance: string;
    logout: string;
    loggedInAs: string;
    requests: string; // NOVÉ
    approvals: string; // NOVÉ
    holidays: string; // NOVÉ
  };
}

// 2. Úprava menuItems
const menuItems: MenuItem[] = [
  { key: "workRecords", href: "/work-records", icon: CalendarCheck },
  { key: "myBalances", href: "/balances", icon: Banknote },
  { key: "requests", href: "/requests", icon: FileQuestion }, // NOVÁ POLOŽKA: Requests
  { key: "overtime", href: "/overtime", icon: Clock },
  {
    key: "reports",
    href: "/reports",
    icon: FileText,
    submenu: [
      { key: "workReport", href: "/reports/work-report", icon: FileBarChart },
      { key: "workList", href: "/reports/work-list", icon: ListTodo },
    ],
  },
  {
    key: "admin",
    href: "/admin",
    icon: Settings,
    adminOnly: true,
    submenu: [
      { key: "employees", href: "/admin/employees", icon: Users },
      { key: "projects", href: "/admin/projects", icon: FolderKanban },
      { key: "holidays", href: "/admin/holidays", icon: CalendarDays }, // NOVÁ PODPOLOŽKA: Holidays
      { key: "approvals", href: "/admin/approvals", icon: CheckSquare }, // NOVÁ PODPOLOŽKA: Approvals
    ],
  },
];

export function Sidebar({ lang }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [dictionaries, setDictionaries] = useState<Record<string, Dictionary>>(
    {},
  );
  const [currentLang, setCurrentLang] = useState<Locale>(lang as Locale);
  const { user, logout } = useAuth();

  // Fetch pending approval count for managers
  const { data: pendingData } = useQuery(GET_PENDING_APPROVAL_COUNT, {
    variables: { managerId: user?.id },
    skip: !user?.id || !user?.isManager,
    pollInterval: 30000, // Poll every 30 seconds
  });

  const pendingCount = pendingData?.pendingApprovalCount || 0;

  // Preload all dictionaries on mount
  useEffect(() => {
    Promise.all([
      import("@/dictionaries/sk.json"),
      import("@/dictionaries/en.json"),
    ]).then(([skModule, enModule]) => {
      const dicts = {
        sk: skModule.default,
        en: enModule.default,
      };
      setDictionaries(dicts);
      setDict(dicts[lang as keyof typeof dicts]);
    });
  }, []);

  // Update dict when lang changes
  useEffect(() => {
    if (dictionaries[lang]) {
      setDict(dictionaries[lang]);
    }
  }, [lang, dictionaries]);

  useEffect(() => {
    setCurrentLang(lang as Locale);
  }, [lang]);

  const handleMenuClick = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "sk" : "en";
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    startTransition(() => {
      setCurrentLang(newLang);
      router.replace(`/${newLang}${pathWithoutLocale}`);
    });
  };

  if (!dict) {
    return null;
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* HEADER */}
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          {dict.sidebar.title}
        </h1>
      </div>
      {/* NAVIGÁCIA */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.adminOnly && !user?.isAdmin) {
              return null;
            }
            const isActive =
              pathname === item.href ||
              (item.submenu &&
                item.submenu.some((sub) => pathname === sub.href));
            const Icon = item.icon;
            const isExpanded = expandedMenu === item.key;
            return (
              <li key={item.href}>
                {item.submenu ? (
                  <div>
                    <Button
                      onClick={() => handleMenuClick(item.key)}
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
                        <span>
                          {dict.sidebar[item.key as keyof typeof dict.sidebar]}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </Button>
                    {isExpanded && (
                      <ul className="space-y-1 mt-2 ml-4">
                        {item.submenu.map((subitem) => {
                          const isSubActive = pathname === subitem.href;
                          const SubIcon = subitem.icon;
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
                                <Link href={`/${lang}${subitem.href}`}>
                                  <span className="flex items-center gap-3 flex-1">
                                    {SubIcon && <SubIcon className="h-4 w-4" />}
                                    <span>
                                      {
                                        dict.sidebar[
                                        subitem.key as keyof typeof dict.sidebar
                                        ]
                                      }
                                    </span>
                                  </span>
                                  {subitem.key === 'approvals' && pendingCount > 0 && (
                                    <Badge
                                      variant="destructive"
                                      className="ml-auto h-5 px-1.5 text-xs font-bold"
                                    >
                                      {pendingCount}
                                    </Badge>
                                  )}
                                </Link>
                              </Button>
                            </li>
                          );
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
                    <Link href={`/${lang}${item.href}`}>
                      <Icon className="h-5 w-5" />
                      <span>
                        {dict.sidebar[item.key as keyof typeof dict.sidebar]}
                      </span>
                    </Link>
                  </Button>
                )}
              </li>
            );
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
            <span>{dict.sidebar.settings}</span>
          </span>
          {isSettingsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
        {/* Collapsible Settings Area */}
        {isSettingsOpen && (
          <div className="p-2 bg-sidebar-accent/50 rounded-md space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {dict.sidebar.language}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                disabled={isPending}
                className="h-8 w-16 gap-2"
              >
                <Languages className="h-3 w-3" />
                {isPending ? "..." : currentLang.toUpperCase()}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {dict.sidebar.appearance}
              </span>
              <ModeToggle />
            </div>
          </div>
        )}
        {/* User Info & Logout */}
        <div className="pt-2 mt-2 border-t border-sidebar-border/50">
          {user && (
            <div className="mb-2 px-2 py-1 text-sm text-muted-foreground truncate">
              <div className="text-xs opacity-70">
                {dict.sidebar.loggedInAs}:
              </div>
              <div
                className="font-semibold text-foreground truncate"
                title={user.username}
              >
                {user.username}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span>{dict.sidebar.logout}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}