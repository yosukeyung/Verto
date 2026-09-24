"use client";

import React from "react";
import Lottie from "lottie-react";
import catAnimation from "@/public/cat-loading.json";

export interface SignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function SignInButton({
  isLoading = false,
  disabled,
  children = "Sign In",
  className = "",
  type = "submit",
  ...props
}: SignInButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed select-none ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <>
          <Lottie
            animationData={catAnimation}
            loop={true}
            className="w-7 h-7 mr-1.5 -ml-2"
          />
          <span>Signing in...</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
