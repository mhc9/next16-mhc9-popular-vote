"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) return <div className="fixed top-4 right-4 z-50 w-10 h-10"></div>

  const toggleOpen = () => setIsOpen(!isOpen)

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center justify-end">
      
      {/* Expanded Menu (Drawer) */}
      <div 
        className={`flex items-center bg-white/20 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-primary/20 rounded-full p-1 shadow-[0_0_15px_rgba(0,246,255,0.1)] transition-all duration-300 ease-out absolute right-0 mr-12 ${
          isOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'
        }`}
      >
        <button
          onClick={() => handleSetTheme("light")}
          className={`p-2 rounded-full transition-all ${
            theme === "light" 
              ? "bg-white/80 dark:bg-white/10 text-primary shadow-[0_0_10px_rgba(0,246,255,0.4)]" 
              : "text-foreground/70 hover:text-primary hover:bg-white/10"
          }`}
          aria-label="Light mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleSetTheme("system")}
          className={`p-2 rounded-full transition-all ${
            theme === "system" 
              ? "bg-white/80 dark:bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,246,255,0.4)]" 
              : "text-foreground/70 hover:text-primary hover:bg-white/10"
          }`}
          aria-label="System theme"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleSetTheme("dark")}
          className={`p-2 rounded-full transition-all ${
            theme === "dark" 
              ? "bg-gray-800 dark:bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,246,255,0.4)]" 
              : "text-foreground/70 hover:text-primary hover:bg-white/10"
          }`}
          aria-label="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`relative z-10 p-2.5 rounded-full bg-white/20 dark:bg-black/60 backdrop-blur-md border transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.3)] flex items-center justify-center ${
          isOpen 
            ? 'border-primary shadow-[0_0_15px_rgba(0,246,255,0.4)] text-primary -rotate-180' 
            : 'border-white/20 dark:border-white/10 text-foreground/80 hover:text-primary hover:border-primary/50'
        }`}
        aria-label="Toggle theme menu"
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </button>

    </div>
  )
}
