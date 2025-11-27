import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { i18n } from "./i18n-config";

function getLocale(request: NextRequest): string {
  // Get locale from cookie if exists
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (localeCookie && i18n.locales.includes(localeCookie as "en" | "sk")) {
    return localeCookie;
  }

  // Negotiator expects plain object
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return matchLocale(
      languages,
      i18n.locales as unknown as string[],
      i18n.defaultLocale,
    );
  } catch {
    return i18n.defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip if it's an internal Next.js path
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );

    // Set cookie for future requests
    response.cookies.set("NEXT_LOCALE", locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  }

  // If locale is in pathname, ensure cookie is set
  const currentLocale = pathname.split("/")[1];
  if (i18n.locales.includes(currentLocale as "en" | "sk")) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", currentLocale, {
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }
}

export const config = {
  // Skip all internal paths (_next, api, static files)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
