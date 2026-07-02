import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-ink-card p-8">
        <h1 className="font-display text-2xl uppercase">
          FITI<span className="text-accent">ZENS</span> Admin
        </h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage the site.</p>
        <LoginForm />
      </div>
    </div>
  );
}
