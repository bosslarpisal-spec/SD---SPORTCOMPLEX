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
        brand: {
          DEFAULT: "#FF7B00",
          hover:   "#e06f00",
        },
      },
      boxShadow: {
        card:        "0 24px 64px rgba(0,0,0,0.7)",
        btn:         "0 4px 18px rgba(255,123,0,0.4)",
        "btn-lg":    "0 8px 28px rgba(255,123,0,0.45)",
        "card-dark": "0 2px 24px rgba(0,0,0,0.5)",
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
