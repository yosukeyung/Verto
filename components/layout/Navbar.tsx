"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  rightAction?: React.ReactNode;
}

export function Navbar({ rightAction }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out py-3 ${isScrolled
        ? "bg-white/75 backdrop-blur-lg border-b border-gray-100 shadow-sm"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center rounded outline-none">
          <Image
            src="/logo_remove.png"
            alt="Verto"
            width={120}
            height={38}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        {rightAction ? <div>{rightAction}</div> : null}
      </div>
    </header>
  );
}