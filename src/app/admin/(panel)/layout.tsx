import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

const nav: { label: string; href: string }[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Trainer", href: "/admin/trainer" },
  { label: "Programs", href: "/admin/programs" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "Socials", href: "/admin/socials" },
  { label: "Blog Posts", href: "/admin/posts" },
  { label: "Newsletter", href: "/admin/newsletter" },
  { label: "Bookings", href: "/admin/leads" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Audit Log", href: "/admin/audit" },
];

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-line bg-ink-soft p-4 md:block">
        <Link href="/admin" className="font-display text-xl uppercase">
          FITI<span className="text-accent">ZENS</span>
        </Link>
        <nav className="mt-6 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-ink-card hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-line pt-4">
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <p className="truncate text-xs text-muted">{admin.email}</p>
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/" className="text-xs text-muted underline hover:text-accent">
              View site →
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-xs text-muted underline hover:text-bad">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-6 md:p-10">
        {/* Mobile nav */}
        <details className="mb-6 md:hidden">
          <summary className="cursor-pointer rounded-lg border border-line bg-ink-card px-4 py-2 text-sm">
            Admin menu
          </summary>
          <nav className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-line bg-ink-card p-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm text-muted hover:bg-ink hover:text-fg"
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction} className="col-span-2 border-t border-line pt-2">
              <button type="submit" className="px-3 py-1 text-xs text-muted underline">
                Sign out
              </button>
            </form>
          </nav>
        </details>
        {children}
      </div>
    </div>
  );
}
