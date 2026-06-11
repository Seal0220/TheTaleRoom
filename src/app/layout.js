import "./globals.css";
import { Cactus_Classical_Serif } from "next/font/google";

const cactusClassicalSerif = Cactus_Classical_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata = {
  title: {
    default: "TheTaleRoom",
    template: "%s | TheTaleRoom",
  },
  description:
    "An empathy-driven interactive story room for narrative reflection.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cactusClassicalSerif.className}>{children}</body>
    </html>
  );
}
