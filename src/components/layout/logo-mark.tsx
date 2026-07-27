// The Cart-2-Chat mark: a shopping bag with a three-dot "typing…" indicator
// where its contents would be — cart and chat fused into one shape. Colors
// read from the same --primary/--primary-foreground tokens as everywhere
// else in the app, so it adapts automatically in dark mode without a
// separate dark-mode SVG.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M 24 27 C 24 19 40 19 40 27"
        stroke="currentColor"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="19" y="27" width="26" height="21" rx="5" fill="currentColor" />
      <circle cx="27" cy="37" r="1.9" fill="var(--primary)" />
      <circle cx="32" cy="37" r="1.9" fill="var(--primary)" />
      <circle cx="37" cy="37" r="1.9" fill="var(--primary)" />
    </svg>
  );
}
