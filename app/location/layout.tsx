import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Menu, X } from 'lucide-react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "Tentang Kami" },
    { href: "/order", label: "Pesan Sekarang!!!" },
    { href: "/location", label: "Lokasi Kami" },
  ];

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <input type="checkbox" id="mobile-menu-toggle-menu" className="hidden peer" />

        <div
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col items-center py-8 px-4 sm:hidden transition-transform duration-300 ease-in-out transform -translate-x-full peer-checked:translate-x-0"
        >
          <nav className="flex flex-col items-center gap-6 text-lg font-semibold mt-16">
            {navLinks.map((link) => (
              <label key={link.href} htmlFor="mobile-menu-toggle-menu" className="cursor-pointer">
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

         <label
          htmlFor="mobile-menu-toggle-menu"
          className="fixed inset-0 bg-black/50 z-30 sm:hidden opacity-0 invisible peer-checked:opacity-100 peer-checked:visible transition-opacity duration-300 ease-in-out"
          aria-label="Close Mobile Menu"
        />

        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-4 sm:px-8 text-sm">
            <Link href={"/"} className="font-semibold text-base sm:text-lg">KEBAB SAYANK</Link>
            <div className="flex items-center gap-2 sm:gap-5">
              <div className="hidden sm:flex gap-5 items-center font-semibold">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>{link.label}</Link>
                ))}
              </div>

              <label
                htmlFor="mobile-menu-toggle-menu"
                className="sm:hidden p-2 cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                <Menu className="h-6 w-6 peer-checked:hidden" />
                <X className="h-6 w-6 hidden peer-checked:block" />
              </label>

              <div className="hidden sm:block">
                {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-8">
          {children}
        </main>
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
    </div>
  );
}
