'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Database, Clock, FileText, Settings, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Work Records', href: '/work-records', icon: CalendarCheck },
  { name: 'Data', href: '/data', icon: Database },
  { name: 'Overtime', href: '/overtime', icon: Clock },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Admin', href: '/admin', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Attendance System
        </h1>
        <ModeToggle />
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-medium hover:bg-sidebar-primary/90',
                    !isActive && 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
