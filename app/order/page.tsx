'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function OrderPage() {
  const handleWhatsAppClick = () => {
    // Ganti nomor WhatsApp sesuai kebutuhan
    const phoneNumber = "6285820247769";
    const message = "Halo, saya ingin memesan kebab";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* Hero Section */}
        <div className="w-full relative h-[500px]">
          <Image
            src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1000&auto=format&fit=crop"
            alt="Kebab Sayank"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Kebab Sayank</h1>
            <p className="text-lg md:text-xl text-center max-w-2xl mb-8">
              Nikmati kelezatan kebab kami dengan berbagai pilihan isian yang menggugah selera
            </p>
          </div>
        </div>

        {/* Menu Preview Section */}
        <div className="max-w-4xl px-4 py-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Menu Favorit Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src="/images/kebab2.jpeg"
                  alt="Kebab Ayam"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Kebab Ayam</h3>
                <p className="text-gray-600 mb-4">Kebab Original isian Ayam dengan ukuran Jumbo</p>
                <p className="text-lg font-bold text-primary">Rp 25.000</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src="/images/hotdog.jpg"
                  alt="Hotdog"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Hotdog</h3>
                <p className="text-gray-600 mb-4">Hotdog isian daging yang dapat menggugah selera makann</p>
                <p className="text-lg font-bold text-primary">Rp 30.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="w-full bg-primary/10 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Pesan Sekarang!</h2>
            <p className="text-lg mb-8">
              Dapatkan promo khusus untuk pemesanan hari ini
            </p>
            <Button 
              onClick={handleWhatsAppClick}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
            >
              Hubungi Kami di WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
