import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { AppFeedback } from "@/components/ui/AppFeedback";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Wedding Invitation",
  description: "You are invited to our wedding.",
  openGraph: {
    title: "Wedding Invitation",
    description: "You are invited to our wedding.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Invitation",
    description: "You are invited to our wedding.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppFeedback>{children}</AppFeedback>
      </body>
    </html>
  );
}
