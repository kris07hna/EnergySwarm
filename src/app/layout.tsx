import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwarmGrid AI - Landing Experience",
  description:
    "Scroll-first landing experience for SwarmGrid AI with animated sections and multi-objective optimization",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%230ea5e9'>⚡</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased overflow-x-hidden">
        <main>{children}</main>
      </body>
    </html>
  );
}
