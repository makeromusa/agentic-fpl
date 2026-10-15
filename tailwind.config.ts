import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fpl: {
          purple: "#37003c",
          green: "#00ff87",
          cyan: "#02efff",
          dark: "#120017",
          card: "#1e0524",
          border: "#330b3d",
          accent: "#e90052"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
