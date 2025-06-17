import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { HeroSection } from '@/components/hero-section';
import { Menu, X } from 'lucide-react';
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";

export default function Home() {
  const navLinks = [
    { href: "/about", label: "Tentang Kami" },
    { href: "/order", label: "Pesan Sekarang!!!" },
    { href: "/location", label: "Lokasi Kami" },
  ];

  return (
    <main className="flex min-h-screen">
      <div className="flex-1 flex flex-col">

        <PublicHeader navLinks={navLinks}/>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full px-4 sm:px-8">
          <HeroSection
            title="Kebab Sayank"
            description="Rasakan sensasi Kebab isi Kepiting, aneka macam Roti Maryam, dan Burger Lezattt"
            image="/images/Burger.jpg"
          />
        </div>
        
        <Footer/>
      </div>
    </main>
  );
}