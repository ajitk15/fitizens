"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "./Button";
import { goalLabels, type Goal } from "@/content/site";

type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  goal: Goal | "";
  level: string;
  name: string;
  whatsapp: string;
  email: string;
  preferredDateTime: string;
  message: string;
  /** Honeypot — must stay empty. */
  company: string;
}

const initial: FormState = {
  goal: "",
  level: "",
  name: "",
  whatsapp: "",
  email: "",
  preferredDateTime: "",
  message: "",
  company: "",
};

const goals: Goal[] = ["fat-loss", "muscle-gain", "recomp", "lifestyle"];
const levels = ["Beginner", "Intermediate", "Advanced"];

export function LeadForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  // Step 1 needs a goal; step 2 needs name + a valid-ish whatsapp number.
  const canContinue =
    step === 0 ? form.goal !== "" : step === 1 ? form.name.trim().length > 1 && form.whatsapp.replace(/\D/g, "").length >= 10 : true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/40 bg-ink-card p-8 text-center shadow-glow">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-2xl uppercase">Request received!</h3>
        <p className="mt-2 text-muted">
          Thanks {form.name.split(" ")[0]} — I&apos;ll reach out on WhatsApp
          shortly to confirm your consultation. You can also book a slot directly
          below.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-ink-card p-6 sm:p-8">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-accent" : "bg-line"}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <fieldset className="space-y-5">
              <legend className="font-display text-xl uppercase">What&apos;s your main goal?</legend>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => update({ goal: g })}
                    className={`rounded-xl border px-4 py-4 text-sm font-medium transition-colors ${
                      form.goal === g
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-line text-muted hover:border-accent/60"
                    }`}
                  >
                    {goalLabels[g]}
                  </button>
                ))}
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted">Your current level (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => update({ level: form.level === l ? "" : l })}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        form.level === l
                          ? "border-accent bg-accent text-ink"
                          : "border-line text-muted hover:border-accent/60"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="space-y-5">
              <legend className="font-display text-xl uppercase">Your details</legend>
              <Field label="Full name" required>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className={inputCls}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </Field>
              <Field label="WhatsApp number" required>
                <input
                  type="tel"
                  required
                  value={form.whatsapp}
                  onChange={(e) => update({ whatsapp: e.target.value })}
                  className={inputCls}
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={inputCls}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="space-y-5">
              <legend className="font-display text-xl uppercase">Almost there</legend>
              <Field label="Preferred date & time for a call">
                <input
                  type="datetime-local"
                  value={form.preferredDateTime}
                  onChange={(e) => update({ preferredDateTime: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Anything else? (optional)">
                <textarea
                  value={form.message}
                  onChange={(e) => update({ message: e.target.value })}
                  rows={4}
                  className={inputCls}
                  placeholder="Tell me a little about where you're starting from…"
                />
              </Field>
            </fieldset>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Honeypot field — hidden from users, catches bots */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Company
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(e) => update({ company: e.target.value })}
          />
        </label>
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            ← Back
          </Button>
        ) : (
          <span />
        )}

        {step < 2 ? (
          <Button
            type="button"
            onClick={() => canContinue && setStep((s) => s + 1)}
            disabled={!canContinue}
          >
            Continue →
          </Button>
        ) : (
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Submit Request"}
          </Button>
        )}
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
