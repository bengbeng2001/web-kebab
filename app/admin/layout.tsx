import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <nav className="w-full flex justify-between border-b border-b-foreground/10 h-16">
          <div className="flex items-center p-3 pl-2 md:pl-8">
          </div>
          <div className="flex items-center p-3 pr-2 md:pr-8">
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto px-2 py-4 md:px-8 md:py-8">
          {children}
        </main>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4 px-2 md:px-0">
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
          <ThemeSwitcher />
        </footer>
      </div>
    </div>
  );
}
