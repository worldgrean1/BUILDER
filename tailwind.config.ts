import animate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

/**
 * TRANSLINK CMS — Unified Tailwind Theme
 * --------------------------------------------------------------
 * 100% derived from the design tokens defined in src/index.css.
 * All colors are HSL CSS variables. No raw hex anywhere.
 * Component classes (.ui-*) live in @layer components in index.css.
 */

// HSL helper — `hsl(var(--token) / <alpha-value>)` enables `bg-brand/40`, etc.
const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;
// Alpha-aware border tokens (subtle/default/strong) use a fixed alpha multiplier.
const hslA = (v: string, a: string) => `hsl(var(${v}) / ${a})`;

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./index.html",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* shadcn semantic */
        border: hsl("--border"),
        input: hsl("--input"),
        ring: hsl("--ring"),
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        primary: { DEFAULT: hsl("--primary"), foreground: hsl("--primary-foreground") },
        secondary: { DEFAULT: hsl("--secondary"), foreground: hsl("--secondary-foreground") },
        destructive: { DEFAULT: hsl("--destructive"), foreground: hsl("--destructive-foreground") },
        muted: { DEFAULT: hsl("--muted"), foreground: hsl("--muted-foreground") },
        accent: { DEFAULT: hsl("--accent"), foreground: hsl("--accent-foreground") },
        popover: { DEFAULT: hsl("--popover"), foreground: hsl("--popover-foreground") },
        card: { DEFAULT: hsl("--card"), foreground: hsl("--card-foreground") },
        sidebar: {
          DEFAULT: hsl("--sidebar-background"),
          foreground: hsl("--sidebar-foreground"),
          primary: hsl("--sidebar-primary"),
          "primary-foreground": hsl("--sidebar-primary-foreground"),
          accent: hsl("--sidebar-accent"),
          "accent-foreground": hsl("--sidebar-accent-foreground"),
          border: hsl("--sidebar-border"),
          ring: hsl("--sidebar-ring"),
        },

        /* Brand */
        brand: hsl("--brand"),
        "brand-soft": hsl("--brand-soft"),
        "brand-dark": hsl("--brand-dark"),
        "brand-teal": hsl("--brand-teal"),
        "brand-teal-soft": hsl("--brand-teal-soft"),

        /* Surfaces */
        "surface-0": hsl("--surface-0"),
        "surface-1": hsl("--surface-1"),
        "surface-2": hsl("--surface-2"),
        "surface-3": hsl("--surface-3"),

        /* Text */
        "text-primary": hsl("--text-primary"),
        "text-secondary": hsl("--text-secondary"),
        "text-muted": hsl("--text-muted"),
        "text-disabled": hsl("--text-disabled"),

        /* Borders (alpha-baked) */
        "border-subtle": hslA("--border-subtle", "var(--border-subtle-a)"),
        "border-default": hslA("--border-default", "var(--border-default-a)"),
        "border-strong": hslA("--border-strong", "var(--border-strong-a)"),

        /* State */
        success: hsl("--success"),
        warning: hsl("--warning"),
        danger: hsl("--danger"),
        info: hsl("--info"),
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        ui: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      // Strict Compact-Pro typography scale — no ad-hoc sizes anywhere in the app.
      fontSize: {
        "ui-micro": ["0.625rem", { lineHeight: "1.35" }], // 10px
        "ui-xs":    ["0.6875rem",{ lineHeight: "1.4"  }], // 11px
        "ui-sm":    ["0.75rem",  { lineHeight: "1.4"  }], // 12px
        "ui-base":  ["0.8125rem",{ lineHeight: "1.4"  }], // 13px
        "ui-lg":    ["0.9375rem",{ lineHeight: "1.25" }], // 15px
        "ui-xl":    ["1.125rem", { lineHeight: "1.2"  }], // 18px
        "ui-2xl":   ["1.5rem",   { lineHeight: "1.2"  }], // 24px
        display:    ["2.25rem",  { lineHeight: "1.15" }], // 36px
      },

      letterSpacing: {
        "ui-tight": "0.01em",
        ui: "0.04em",
        "ui-wide": "0.08em",
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "ui-xs": "var(--radius-xs)",
        "ui-sm": "var(--radius-sm)",
        "ui-md": "var(--radius-md)",
        "ui-lg": "var(--radius-lg)",
        pill: "8px",
      },

      boxShadow: {
        "elevation-low":   "var(--elevation-low)",
        "elevation-md":    "var(--elevation-md)",
        "elevation-high":  "var(--elevation-high)",
        "elevation-float": "var(--elevation-float)",
      },

      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
        "4xl": "var(--spacing-4xl)",
        "panel-sidebar": "var(--panel-sidebar-width)",
        "panel-inspector": "var(--panel-inspector-width)",
        "panel-topbar": "var(--panel-topbar-height)",
        "button-x": "var(--spacing-md)",
        "card-pad": "var(--spacing-lg)",
        "input-x": "var(--spacing-md)",
      },

      height:    { button: "var(--button-height)", input: "var(--input-height)", topbar: "var(--panel-topbar-height)" },
      minHeight: { button: "var(--button-height)", input: "var(--input-height)" },

      transitionDuration: { fast: "120ms", normal: "180ms", slow: "260ms" },
      transitionTimingFunction: { ui: "ease-out" },

      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
