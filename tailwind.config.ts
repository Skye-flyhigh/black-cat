import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "node_modules/@llamaindex/chat-ui/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(248, 12%, 25%)", // Desaturated navy border
        input: "hsl(248, 15%, 18%)", // Slightly brighter field
        ring: "hsl(270, 100%, 70%)", // Glitch ring color
        background: "hsl(248, 15%, 7%)", // Deep midnight blue
        foreground: "hsl(258, 20%, 90%)", // Soft lavender white
        primary: {
          DEFAULT: "hsl(270, 70%, 60%)", // Glitch violet
          foreground: "hsl(0, 0%, 100%)", // White on primary
        },
        secondary: {
          DEFAULT: "hsl(248, 12%, 20%)", // Subtle blue/grey secondary
          foreground: "hsl(258, 20%, 85%)", // Lavender secondary text
        },
        destructive: {
          DEFAULT: "hsl(0, 85%, 50%)", // High alert red
          foreground: "hsl(0, 0%, 100%)", // White text on danger
        },
        muted: {
          DEFAULT: "hsl(248, 10%, 14%)", // Subtle navy-muted tone
          foreground: "hsl(258, 15%, 65%)", // Dimmed lilac text
        },
        accent: {
          DEFAULT: "hsl(270, 70%, 50%)", // Electric violet
          foreground: "hsl(0, 0%, 100%)", // Pure white
        },
        popover: {
          DEFAULT: "hsl(248, 15%, 10%)", // Shadowy violet
          foreground: "hsl(258, 20%, 88%)", // Gentle pale lilac
        },
        card: {
          DEFAULT: "hsl(248, 15%, 8%)", // Card base (deep midnight blue)
          foreground: "hsl(258, 20%, 88%)", // Same as general foreground
        },
      },
      borderRadius: {
        xl: `calc(var(--radius) + 4px)`,
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
