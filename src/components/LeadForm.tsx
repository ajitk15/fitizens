"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { goalLabels, type Goal } from "@/content/site";

const GOAL_VALUES: Goal[] = ["fat-loss", "muscle-gain", "recomp", "lifestyle"];

type Status = "idle" | "submitting" | "success" | "error";

interface FormState {
  goal: Goal | "";
  level: string;
  name: string;
  /** Country calling code, e.g. "+91". */
  code: string;
  whatsapp: string;
  email: string;
  preferredDateTime: string;
  message: string;
  /** Newsletter opt-in — uses the same email. */
  subscribe: boolean;
  /** Honeypot — must stay empty. */
  company: string;
}

const initial: FormState = {
  goal: "",
  level: "",
  name: "",
  code: "+91",
  whatsapp: "",
  email: "",
  preferredDateTime: "",
  message: "",
  subscribe: false,
  company: "",
};

const goals: Goal[] = ["fat-loss", "muscle-gain", "recomp", "lifestyle"];
const levels = ["Beginner", "Intermediate", "Advanced"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LeadForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  // Set when the user tries to continue with invalid fields — reveals the
  // per-field messages instead of silently blocking.
  const [attempted, setAttempted] = useState(false);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  // Pre-fill the goal when arriving from the program-finder quiz (/contact?goal=…).
  // One-time sync from the URL (an external system) on mount; intentionally runs once.
  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("goal");
    if (!g || !(GOAL_VALUES as string[]).includes(g)) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setForm((f) => ({ ...f, goal: g as Goal }));
    setStep(1);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  /* ---------------- validation ---------------- */
  const goalError = form.goal === "" ? "Please pick a goal." : "";
  const nameError = form.name.trim().length >= 2 ? "" : "Please enter your full name.";
  const codeOk = /^\+\d{1,3}$/.test(form.code.trim());
  const waDigits = form.whatsapp.replace(/\D/g, "");
  const whatsappError = !codeOk
    ? "Country code must look like +91."
    : form.whatsapp.trim() !== "" && /[^\d\s-]/.test(form.whatsapp.trim())
      ? "The number can only contain digits."
      : form.code.trim() === "+91"
        ? waDigits.length === 10
          ? ""
          : "Enter the 10-digit mobile number (without the country code)."
        : waDigits.length >= 6 && waDigits.length <= 14
          ? ""
          : "Enter a valid number for that country code.";
  const emailError = EMAIL_RE.test(form.email.trim()) ? "" : "Please enter a valid email address.";
  const detailsValid = !nameError && !whatsappError && !emailError;

  function advance() {
    const ok = step === 0 ? !goalError : step === 1 ? detailsValid : true;
    if (!ok) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    if (step < 2) setStep((s) => s + 1);
  }

  function back() {
    setAttempted(false);
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Enter on an earlier step advances instead of submitting half a form.
    if (step < 2) {
      advance();
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Full international format, e.g. "+919876543210".
          whatsapp: `${form.code.trim()}${waDigits}`,
          email: form.email.trim(),
        }),
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
          {`Thanks ${form.name.split(" ")[0]} — I'll reach out on WhatsApp shortly to confirm your consultation.`}
          {form.subscribe && " You're also on the newsletter list — welcome!"}
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
              <FieldError show={attempted} message={goalError} />
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
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className={inputCls(attempted && !!nameError)}
                  placeholder="Your name"
                  autoComplete="name"
                />
                <FieldError show={attempted} message={nameError} />
              </Field>
              <Field label="WhatsApp number" required>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={form.code}
                    onChange={(e) => update({ code: e.target.value })}
                    className={inputCls(attempted && !codeOk, "w-24 shrink-0 text-center")}
                    aria-label="Country code"
                    autoComplete="tel-country-code"
                  />
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) => update({ whatsapp: e.target.value })}
                    className={inputCls(attempted && !!whatsappError && codeOk)}
                    placeholder="98765 43210"
                    autoComplete="tel-national"
                  />
                </div>
                <FieldError show={attempted} message={whatsappError} />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={inputCls(attempted && !!emailError)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <FieldError show={attempted} message={emailError} />
              </Field>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-ink px-4 py-3 transition-colors hover:border-accent/60">
                <input
                  type="checkbox"
                  checked={form.subscribe}
                  onChange={(e) => update({ subscribe: e.target.checked })}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent,#ff5722)]"
                />
                <span className="text-sm text-muted">
                  Send me the FITIZENS newsletter — fitness tips and updates to the email
                  above. Unsubscribe anytime with one click.
                </span>
              </label>
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
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Anything else? (optional)">
                <textarea
                  value={form.message}
                  onChange={(e) => update({ message: e.target.value })}
                  rows={4}
                  className={inputCls(false)}
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
        <p className="mt-4 text-sm text-bad">{error}</p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button key="back" type="button" variant="ghost" onClick={back}>
            ← Back
          </Button>
        ) : (
          <span />
        )}

        {/* Distinct keys keep Continue and Submit as separate DOM nodes — reusing
            one node lets the browser fire the click's default action against the
            swapped-in submit button and submit the form a step early. */}
        {step < 2 ? (
          <Button key="continue" type="button" onClick={advance}>
            Continue →
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Submit Request"}
          </Button>
        )}
      </div>
    </form>
  );
}

const inputCls = (invalid: boolean, width = "w-full") =>
  `${width} rounded-xl border bg-ink px-4 py-3 text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${
    invalid ? "border-bad" : "border-line"
  }`;

function FieldError({ show, message }: { show: boolean; message: string }) {
  if (!show || !message) return null;
  return <p className="mt-2 text-xs text-bad">{message}</p>;
}

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
