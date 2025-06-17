import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Menu, X, Plus } from 'lucide-react';
import { Footer } from "@/components/footer";
import { CartButton } from '@/components/cart-button';
import { MainButton } from '@/components/main-button';
import { LogoutButton } from '@/components/logout-button';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let username = '';
  if (user) {
    const { data: profile } = await supabase
      .from('users_public')
      .select('username')
      .eq('auth_id', user.id)
      .single();
    username = profile?.username || user.email;
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        
        <input type="checkbox" id="mobile-menu-toggle-menu" className="hidden peer" />

        {/* Mobile Navbar SSR */}
        <div className="sm:hidden block">
          <nav className="w-full flex items-center justify-between border-b border-b-foreground/10 h-16 px-4 md:px-8">
            <div className="flex items-center gap-2">
              <CartButton />
              <MainButton />
              <Button asChild size="icon" variant="default">
                <a href="/customer/pesan" aria-label="Pesan Disini">
                  <Plus className="w-5 h-5" />
                </a>
              </Button>
            </div>
            <div className="text-sm font-semibold truncate max-w-[120px] text-center">Hallo, {username}</div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </nav>
        </div>
        {/* Desktop Navbar SSR */}
        <div className="hidden sm:block">
          <nav className="w-full flex items-center border-b border-b-foreground/10 h-16 px-4 md:px-8">
            <div className="w-24 flex items-center flex-shrink-0">
              <label
                htmlFor="mobile-menu-toggle-menu"
                className="block sm:hidden cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </label>
            </div>
            <div className="flex-1 min-w-0 flex justify-center items-center">
              <Link 
                href="/customer/pesan" 
                className="text-lg font-semibold hover:text-primary transition-colors truncate text-center block w-full"
                style={{wordBreak: 'break-word'}}
              >
                Pesan Sekarang!!!
              </Link>
            </div>
            <div className="w-24 flex justify-end flex-shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold truncate max-w-[120px] text-center">Hallo, {username}</span>
                <CartButton />
                <MainButton />
                <LogoutButton />
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-r-foreground/10 transform -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 ease-in-out z-40 sm:hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <label
                htmlFor="mobile-menu-toggle-menu"
                className="cursor-pointer"
                aria-label="Close Mobile Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </label>
            </div>
            <nav className="space-y-4">
              <Link
                href="/customer/pesan"
                className="block py-2 hover:text-primary transition-colors"
              >
                Pesan Sekarang
              </Link>
              <Link
                href="/customer/pesanan-anda"
                className="block py-2 hover:text-primary transition-colors"
              >
                Pesanan Anda
              </Link>
            </nav>
          </div>
        </div>

        <label
          htmlFor="mobile-menu-toggle-menu"
          className="fixed inset-0 bg-black/50 z-30 sm:hidden opacity-0 invisible peer-checked:opacity-100 peer-checked:visible transition-opacity duration-300 ease-in-out"
          aria-label="Close Mobile Menu"
        />

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-8">
          {children}
        </main>

        <Footer/>
      </div>
    </div>
  );
}
