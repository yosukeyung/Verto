"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import catAnimation from "@/public/cat-loading.json";

export interface SignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  destination?: string;
}

export function SignInButton({
  children = "Sign In",
  className = "text-sm font-medium text-gray-700 hover:text-gray-900 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500",
  destination = "/login",
  onClick,
  ...props
}: SignInButtonProps) {
  const router = useRouter();
  const [showOverlay, setShowOverlay] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    router.push(destination);
    timeoutRef.current = setTimeout(() => {
      setShowOverlay(true);
    }, 800);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className}
        {...props}
      >
        <span>{children}</span>
      </button>

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Lottie
            animationData={catAnimation}
            loop={true}
            className="w-64 h-64 sm:w-80 sm:h-80"
          />
        </div>
      )}
    </>
  );
}
