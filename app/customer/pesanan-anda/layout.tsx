export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: "/customer/menu", label: "Menu" }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Menu Overlay */}
      <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />
      <label
        htmlFor="mobile-menu-toggle"
        className="fixed inset-0 bg-black/50 z-30 sm:hidden opacity-0 invisible peer-checked:opacity-100 peer-checked:visible transition-opacity duration-300 ease-in-out"
        aria-label="Close Mobile Menu"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
