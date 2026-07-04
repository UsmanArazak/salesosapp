"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RecoveryRedirector() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && (hash.includes("type=recovery") || hash.includes("access_token="))) {
        // Redirect to /reset-password with the hash fragment intact
        router.replace(`/reset-password${hash}`);
      }
    }
  }, [router]);

  return null;
}
