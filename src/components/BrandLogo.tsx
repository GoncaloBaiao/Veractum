import Image from "next/image";
import type { BrandLogoProps } from "@/types";

const SIZES = {
  sm: 40,
  md: 56,
  lg: 72,
} as const;

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const px = SIZES[size];

  return (
    <Image
      src="/WizeApple.png"
      alt="Veractum logo"
      width={px}
      height={px}
      className={className}
      priority
    />
  );
}
