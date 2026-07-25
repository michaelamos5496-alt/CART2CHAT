import type { CSSProperties } from "react";

// Shared recharts <Tooltip> styling so every chart in analytics matches the
// app's card/border/text tokens instead of recharts' default white box.
// CSS custom properties resolve correctly here since recharts applies these
// as inline styles, which support var() the same as any other CSS value.
export const chartTooltipContentStyle: CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: 12,
  padding: "6px 10px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "var(--foreground)",
  fontWeight: 500,
  marginBottom: 2,
};

export const chartTooltipItemStyle: CSSProperties = {
  color: "var(--muted-foreground)",
  padding: 0,
};
