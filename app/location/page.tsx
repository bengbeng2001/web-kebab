'use client'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import QrisImage from './qris.png'; // Import gambar QRIS

export default function LocationPage() {

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
        {/* Hero Section with Map Background */}
        <div className="relative w-full h-[400px]">
          <Image
            src="/images/Burger.jpg"
            alt="Burger"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold text-center">Lokasi Kami</h1>
          </div>
        </div>

        {/* Location Details Section */}
        <div className="max-w-4xl px-4 text-center space-y-4">
          <h2 className="text-3xl font-bold mb-4">Kunjungi Kebab Sayank</h2>
          <p className="text-lg text-gray-600">
            <strong>Alamat:</strong> Jl. Karang Menjangan No.75, Airlangga, Kec. Gubeng, Surabaya, Jawa Timur 60286
          </p>
          <p className="text-lg text-gray-600">
            <strong>Jam Buka:</strong> 10:00 - 22:00
          </p>
          <p className="text-lg text-gray-600">
            <strong>No. Telepon:</strong> 0858-2024-7769 (WhatsApp)
          </p>
          <Button
            onClick={handleWhatsAppClick}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
          >
            Hubungi Kami di WhatsApp
          </Button>

          {/* Map and QRIS Section */}
          <div className="mt-8 flex flex-wrap justify-center items-start gap-8 w-full">
            {/* Google Map Embed */}
            <div className="w-full md:w-2/3">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1978.6592377342912!2d112.7610195!3d-7.2700769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb043ff92fb9%3A0xb6db69d63dfd904!2sKebab%20Sayank!5e0!3m2!1sid!2sid!4v1717582414914!5m2!1sid!2sid"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
