import Image from "next/image";
import type { BrandLogoProps } from "@/types";

const SIZES = {
  sm: 28,
  md: 36,
  lg: 48,
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
