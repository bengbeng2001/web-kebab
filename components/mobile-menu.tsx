'use client'
import Link from 'next/link';
import { useState } from 'react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        aria-label="Toggle menu"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </>
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg">
          <nav className="flex flex-col p-4 space-y-4">
            <Link 
              href="/menu" 
              className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Menu
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Tentang Kami
            </Link>
            <Link 
              href="/order" 
              className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pesan Sekarang!!!
            </Link>
            <Link 
              href="/location" 
              className="px-4 py-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Lokasi Kami
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
} 