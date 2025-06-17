import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: "/about", label: "Tentang Kami" },
    { href: "/order", label: "Pesan Sekarang!!!" },
    { href: "/location", label: "Lokasi Kami" },
  ];

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">

        <PublicHeader navLinks={navLinks}/>
        
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-8">
          {children}
        </main>

        <Footer/>
      </div>
    </div>
  );
}
