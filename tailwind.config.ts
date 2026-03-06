import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      colors: {
        blue: {
          brand: "#3b6ef6",
          hover: "#2a5ce0",
          light: "#eef2ff",
        },
      },
      boxShadow: {
        card: "0 24px 64px rgba(0,0,0,0.45)",
        btn:  "0 4px 18px rgba(59,110,246,0.35)",
        "btn-lg": "0 8px 28px rgba(59,110,246,0.4)",
      },
      borderRadius: {
        card: "22px",
      },
      backgroundImage: {
        "page-grad":
          "radial-gradient(ellipse at 50% -10%, #252525 0%, #141414 45%, #080808 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
