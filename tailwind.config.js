/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // OPay Brand
        "opay-green": "#00B140",
        "opay-green-dark": "#008F33",
        "opay-green-light": "#E6F7ED",
        // Funnel accent colors
        tof: "#00B140", // Top of Funnel — Awareness
        mof: "#0066CC", // Middle of Funnel — Consideration
        bof: "#F5A623", // Bottom of Funnel — Conversion
        // Chart fill backgrounds
        "tof-fill": "#E6F7ED",
        "mof-fill": "#E6F0FA",
        "bof-fill": "#FEF3DC",
        // Page + surface
        page: "#F4F6F8",
        surface: "#FFFFFF",
        // Text
        "text-primary": "#0D1117",
        "text-secondary": "#4B5563",
        "text-muted": "#9CA3AF",
        // Borders
        "border-default": "#E5E7EB",
        "border-strong": "#D1D5DB",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "kpi-lg": [
          "32px",
          { lineHeight: "1.0", letterSpacing: "-0.5px", fontWeight: "700" },
        ],
        kpi: [
          "28px",
          { lineHeight: "1.0", letterSpacing: "-0.3px", fontWeight: "700" },
        ],
      },
      boxShadow: {
        card: "rgba(0, 71, 28, 0.08) 0px 2px 8px 0px",
        elevated:
          "rgba(0, 71, 28, 0.12) 0px 4px 16px 0px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px",
        header: "rgba(0, 71, 28, 0.06) 0px 2px 4px 0px",
      },
      borderRadius: {
        card: "10px",
        "card-lg": "12px",
        modal: "16px",
      },
    },
  },
  plugins: [],
};
