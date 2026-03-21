"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LandingTheme() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" || pathname === "/landing_two") {
      document.body.style.background =
        pathname === "/landing_two" ? "hsl(260 87% 3%)" : "#000";
      document.body.style.color =
        pathname === "/landing_two" ? "hsl(40 6% 95%)" : "#fff";
    } else {
      document.body.style.background = "";
      document.body.style.color = "";
    }
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [pathname]);

  return null;
}
