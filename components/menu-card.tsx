import Image from 'next/image';

interface MenuCardProps {
  name: string;
  description: string;
  price: number;
  image: string;
}

export function MenuCard({ name, description, price, image }: MenuCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative w-full h-48">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{name}</h2>
        <p className="text-gray-600 mb-4">{description}</p>
        <p className="text-lg font-bold text-primary">Rp {price.toLocaleString()}</p>
      </div>
    </div>
  );
} 