import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#142820", pine: "#12392c", moss: "#d9efab", paper: "#f6f7f2" } } },
} satisfies Config;
