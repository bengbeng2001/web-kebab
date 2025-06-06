import Image from 'next/image';

interface HeroSectionProps {
  title: string;
  description: string;
  image: string;
}

export function HeroSection({ title, description, image }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 100vw"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 flex flex-col items-center justify-center text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-center max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="mt-4 sm:mt-8">
            <a
              href="/order"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 