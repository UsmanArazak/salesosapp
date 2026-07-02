import Link from "next/link";

type Step = {
  key: string;
  emoji: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
};

export function OnboardingChecklist({ steps }: { steps: Step[] }) {
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div
      className="rounded-2xl border p-4 mb-4"
      style={{
        background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(249,115,22,0.01) 100%)",
        borderColor: "rgba(249,115,22,0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            🚀 Get started with SalesOS
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Complete these steps to set up your business
          </p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(249,115,22,0.12)", color: "var(--accent)" }}
        >
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full mb-4 overflow-hidden" style={{ background: "var(--border-color)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(completedCount / steps.length) * 100}%`,
            background: "var(--accent)",
          }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.key}
            className="flex items-center gap-3 rounded-xl p-2.5 border bg-white"
            style={{ borderColor: step.done ? "rgba(22,163,74,0.2)" : "var(--border-color)" }}
          >
            {/* Checkbox */}
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: step.done ? "rgba(22,163,74,0.1)" : "var(--bg-elevated)",
                border: `2px solid ${step.done ? "#16a34a" : "var(--border-color)"}`,
              }}
            >
              {step.done && (
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth={3} className="w-2.5 h-2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span>{step.emoji}</span>
                <p
                  className="text-xs sm:text-sm font-semibold truncate"
                  style={{
                    color: step.done ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: step.done ? "line-through" : "none",
                  }}
                >
                  {step.title}
                </p>
              </div>
            </div>

            {/* CTA */}
            {!step.done && (
              <Link
                href={step.href}
                className="text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all active:scale-[0.97]"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {step.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
