import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { HeroSection } from '@/components/hero-section';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const navLinks = [
    { href: "/about", label: "Tentang Kami" },
    { href: "/order", label: "Pesan Sekarang!!!" },
    { href: "/location", label: "Lokasi Kami" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-10 sm:gap-20 items-center">

        {/* --- Mobile Menu Elements (Siblings) --- */}
        {/* Hidden checkbox (peer) */}
        <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />

        {/* Mobile Menu Drawer (controlled by peer-checked) */}
        <div
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col items-center py-8 px-4 sm:hidden transition-transform duration-300 ease-in-out transform -translate-x-full peer-checked:translate-x-0"
        >
          <nav className="flex flex-col items-center gap-6 text-lg font-semibold mt-16">
            {navLinks.map((link) => (
              // Wrap Link in a Label to close menu on click (using htmlFor)
              <label key={link.href} htmlFor="mobile-menu-toggle" className="cursor-pointer">
                <Link 
                  href={link.href}
                >
                  {link.label}
                </Link>
              </label>
            ))}
          </nav>
           <div className="mt-8">
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
           </div>
           <div className="mt-auto flex items-center justify-center text-xs gap-4 py-4">
              <ThemeSwitcher />
           </div>
        </div>

         {/* Overlay (Label to close the menu, controlled by peer-checked) */}
        <label
          htmlFor="mobile-menu-toggle"
          className="fixed inset-0 bg-black/50 z-30 sm:hidden opacity-0 invisible peer-checked:opacity-100 peer-checked:visible transition-opacity duration-300 ease-in-out"
          aria-label="Close Mobile Menu"
        />
        {/* --- End Mobile Menu Elements --- */}


        {/* Navbar (contains the hamburger label linked to the checkbox) */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-4 sm:px-8 text-sm">
            <Link href={"/"} className="font-semibold text-base sm:text-lg">KEBAB SAYANK</Link>
            <div className="flex items-center gap-2 sm:gap-5">
              {/* Desktop Nav Links */}
              <div className="hidden sm:flex gap-5 items-center font-semibold">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>{link.label}</Link>
                ))}
              </div>

              {/* Mobile Menu Button (Label for Checkbox) - Stays in Navbar */}
              <label
                htmlFor="mobile-menu-toggle" // This links it to the checkbox outside nav
                className="sm:hidden p-2 cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                {/* Icons are controlled by peer-checked CSS on the checkbox outside nav */}
                <Menu className="h-6 w-6 peer-checked:hidden" />
                <X className="h-6 w-6 hidden peer-checked:block" />
              </label>

              {/* Auth Button (Visible on both mobile and desktop) */}
              <div className="hidden sm:block">
                 {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              </div>
            </div>
          </div>
        </nav>


        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full px-4 sm:px-8">
          <HeroSection
            title="Kebab Sayank"
            description="Rasakan sensasi Kebab isi Kepiting, aneka macam Roti Maryam, dan Burger Lezattt"
            image="/images/Burger.jpg"
          />
        </div>
        
        {/* Footer */}
        <footer className="w-full flex flex-col sm:flex-row items-center justify-center border-t mx-auto text-center text-xs gap-4 sm:gap-8 py-8 sm:py-16 px-4 sm:px-0">
          <p>
            &copy; 2025 Kebab Sayank.
            {" "}
            <a
              href="https://www.kebabsayank.com"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              All Rights Reserved
            </a>
          </p>
           <div className="hidden sm:block">
             <ThemeSwitcher />
           </div>
        </footer>
      </div>
    </main>
  );
}