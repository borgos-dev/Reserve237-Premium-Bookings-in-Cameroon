// Text version of the Reserve237 logo for LIGHT surfaces, where the white
// PNG logo is unreadable. The PNG stays on dark surfaces (dashboard sidebar,
// sign-up brand panel). Typography mirrors the logo: serif, gold "237".

import { cn } from "@/lib/utils";

interface LogoWordmarkProps {
  className?: string;
  /** Tailwind text size utility, e.g. "text-2xl" */
  size?: string;
}

export function LogoWordmark({ className, size = "text-2xl" }: LogoWordmarkProps) {
  return (
    <span
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      className={cn("font-bold tracking-tight leading-none select-none", size, className)}
    >
      <span className="text-[#1F2A2A]">Reserve</span>
      <span className="text-[#C79A56]">237</span>
    </span>
  );
}
