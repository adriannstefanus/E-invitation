"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { FLASH_PARAM_KEYS, flashFromSearchParams } from "@/lib/flash";

export function FlashToasts() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const seenRef = useRef("");

  useEffect(() => {
    const query = searchParams.toString();
    const key = `${pathname}?${query}`;
    if (key === seenRef.current) {
      return;
    }

    const flash = flashFromSearchParams(searchParams, pathname);
    if (!flash) {
      return;
    }

    seenRef.current = key;
    toast(flash);

    const next = new URLSearchParams(searchParams.toString());
    for (const name of FLASH_PARAM_KEYS) {
      next.delete(name);
    }
    const suffix = next.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, toast]);

  return null;
}
