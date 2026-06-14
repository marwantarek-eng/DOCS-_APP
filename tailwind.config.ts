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
        sans: ["Cairo", "DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        navy: "#0B2545",
        "docs-mid": "#134074",
        "docs-teal": "#0E7490",
      },
      scale: { "98": "0.98" },
    },
  },
  plugins: [],
};

export default config;