export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto px-2 py-4 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
