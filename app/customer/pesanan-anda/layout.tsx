export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
