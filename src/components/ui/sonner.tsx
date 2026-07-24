"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        position="top-center"
        richColors
        style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--warning-bg": "oklch(0.95 0.05 80)",
          "--warning-text": "oklch(0.4 0.1 80)",
          "--warning-border": "oklch(0.9 0.08 80)",
          "--error-bg": "oklch(0.93 0.06 25)",
          "--error-text": "oklch(0.4 0.12 25)",
          "--error-border": "oklch(0.88 0.1 25)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
