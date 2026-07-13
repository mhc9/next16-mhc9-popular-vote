import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import Image from "next/image";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบ Popular Vote",
  description: "ระบบโหวตผลงานนวัตกรรม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Link href="/" className="fixed top-4 left-4 z-50 group outline-none" aria-label="Home">
            <div className="relative w-10 h-10 flex items-center justify-center bg-white/20 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full p-0.5 shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,246,255,0.5)]">
              
              {/* Revolving Indicator Animation */}
              <div className="absolute inset-[-2px] rounded-full border border-transparent border-t-primary border-r-primary/50 animate-[spin_3s_linear_infinite] group-hover:animate-[spin_1s_linear_infinite] group-hover:border-t-primary group-hover:border-r-primary shadow-[0_0_10px_rgba(0,246,255,0.5)]"></div>
              
              {/* Animated hover glow inside */}
              <div className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/20 blur-md transition-all duration-500"></div>
              
              <div className="w-full h-full relative z-10 rounded-full overflow-hidden flex items-center justify-center bg-white/80 dark:bg-transparent">
                <Image 
                  src="/logo_dmh.png?v=2" 
                  alt="DMH Logo" 
                  width={40} 
                  height={40} 
                  className="w-[85%] h-[85%] object-contain transition-all duration-500 group-hover:drop-shadow-[0_0_8px_rgba(0,246,255,0.8)]"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </Link>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
