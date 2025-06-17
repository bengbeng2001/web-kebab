import { ThemeSwitcher } from "@/components/theme-switcher";
export function Footer() {
    return (
        <div>
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
    )
}