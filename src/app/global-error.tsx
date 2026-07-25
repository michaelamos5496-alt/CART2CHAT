"use client";

import * as React from "react";

import { logError } from "@/lib/logger";

// Only fires if the root layout itself throws — everything from
// ThemeProvider to fonts lives in that layout, so this can't assume any of
// it survived. It renders its own <html>/<body> deliberately bare.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    logError(error, { digest: error.digest, boundary: "global" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100svh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          padding: "1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
          Something went wrong
        </h1>
        <p
          style={{ color: "#6b7280", maxWidth: "24rem", fontSize: "0.875rem" }}
        >
          The app hit an unexpected error loading. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
