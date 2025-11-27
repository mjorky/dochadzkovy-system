"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { getSitePages } from "@/lib/site-pages";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "@/contexts/dictionary-context";

export function UnifiedHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const sitePages = getSitePages(t);

  // Remove locale from pathname for config lookup
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
  const normalizedPathname =
    pathnameWithoutLocale === "/"
      ? "/"
      : pathnameWithoutLocale.replace(/\/$/, "");

  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "sk";

  // 1. Determine Title and Description
  const currentPageConfig = sitePages[normalizedPathname];

  // Fallback logic: derive title from the last path segment if not configured
  const pathSegments = normalizedPathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  const fallbackTitle = lastSegment
    ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
    : t.common.dashboard;

  const title = currentPageConfig?.title || fallbackTitle;
  const description = currentPageConfig?.description;

  // 2. Generate Breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    const items = [
      {
        href: `/${locale}`,
        label: sitePages["/"]?.label || t.common.home,
        current: normalizedPathname === "/",
        isContainer: false,
      },
    ];

    if (normalizedPathname === "/") return items;

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Try to get label from config
      const config = sitePages[currentPath];
      let label = config?.label || config?.title || segment;

      // Capitalize if it was just the segment and no config found
      if (!config) {
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }

      items.push({
        href: `/${locale}${currentPath}`,
        label,
        current: isLast,
        isContainer: config?.isContainer || false,
      });
    });

    return items;
  }, [pathname, pathSegments, locale, normalizedPathname]);

  // Determine if we should show the header at all (e.g. if it's the root and we don't want it, or just always show)
  // For now, we always show it except login.
  if (pathname.includes("/login")) return null;

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {item.current ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.isContainer ? (
                  <span className="font-normal text-muted-foreground cursor-default">
                    {item.label}
                  </span>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <Separator />
    </div>
  );
}
