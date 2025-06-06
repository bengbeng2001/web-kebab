import Image from 'next/image';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* Hero Section */}
        <div className="w-full relative h-[300px]">
          <Image
            src="/images/Burger.jpg"
            alt="Kebab Sayank"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-white">Tentang Kami</h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl px-4 py-8">
          <div className="space-y-8">

            <section>
              <h2 className="text-2xl font-bold mb-4">Jam Operasional</h2>
              <div className="bg-gray-50 p-6 rounded-lg dark:text-black">
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="font-medium">Senin - Jumat</span>
                    <span>10:00 - 22:00</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Sabtu - Minggu</span>
                    <span>09:00 - 23:00</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Sejarah Kebab Sayank</h2>
              <p className="text-gray-600 leading-relaxed">
                Kebab Sayank didirikan pada tahun 2020 dengan visi untuk menghadirkan cita rasa kebab autentik dengan sentuhan lokal Indonesia.
                <br />Kami memulai perjalanan kami dari sebuah gerobak kecil dan kini telah berkembang menjadi salah satu restoran kebab terfavorit di kota ini.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Visi & Misi</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Visi</h3>
                  <p className="text-gray-600">
                    Menjadi restoran kebab terbaik yang menghadirkan pengalaman kuliner berkualitas dengan harga terjangkau.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Misi</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Menghadirkan kebab dengan kualitas terbaik</li>
                    <li>Memberikan pelayanan yang ramah dan profesional</li>
                    <li>Menggunakan bahan-bahan segar dan berkualitas</li>
                    <li>Mengembangkan menu inovatif yang sesuai dengan selera lokal</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Keunggulan Kami</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Bahan Berkualitas</h3>
                  <p className="text-gray-600">
                    Kami hanya menggunakan bahan-bahan segar dan berkualitas tinggi untuk setiap hidangan kami.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Resep Rahasia</h3>
                  <p className="text-gray-600">
                    Kombinasi bumbu rahasia kami membuat setiap gigitan kebab menjadi pengalaman yang tak terlupakan.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Pelayanan Terbaik</h3>
                  <p className="text-gray-600">
                    Tim kami siap melayani Anda dengan ramah dan profesional setiap saat.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">Harga Terjangkau</h3>
                  <p className="text-gray-600">
                    Kami menawarkan kualitas premium dengan harga yang terjangkau untuk semua kalangan.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}