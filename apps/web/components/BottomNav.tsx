"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label_hi: "दर्शन",
    label_en: "Live",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  {
    href: "/timings",
    label_hi: "समय",
    label_en: "Timings",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/utsav",
    label_hi: "उत्सव",
    label_en: "Utsav",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/mandir",
    label_hi: "मंदिर",
    label_en: "Mandir",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V10l7-7 7 7v11" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="14" width="6" height="7" />
      </svg>
    ),
  },
  {
    href: "/temples",
    label_hi: "मंदिर सूची",
    label_en: "Temples",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
        <circle cx="12" cy="11" r="3" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="bottom-nav" aria-label="मुख्य नेविगेशन">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item${isActive ? " active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label_hi}
          >
            {item.icon(isActive)}
            <span>{item.label_hi}</span>
          </Link>
        );
      })}
    </nav>
  );
}
