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

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <input type="checkbox" id="mobile-menu-toggle-menu" className="hidden peer" />

        <nav className="w-full flex justify-between items-center border-b border-b-foreground/10 h-16 px-4 md:px-8">
          <div className="w-24">
            {/* Left spacer for balance */}
          </div>
          <div className="flex-1 flex justify-center">
            <Link 
              href="/customer/pesan" 
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              Pesan Sekarang!!!
            </Link>
          </div>
          <div className="w-24 flex justify-end">
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        <label
          htmlFor="mobile-menu-toggle-menu"
          className="fixed inset-0 bg-black/50 z-30 sm:hidden opacity-0 invisible peer-checked:opacity-100 peer-checked:visible transition-opacity duration-300 ease-in-out"
          aria-label="Close Mobile Menu"
        />

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
