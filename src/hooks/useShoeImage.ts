import { useState, useEffect } from "react";
import { getShoeImageUrl } from "@/lib/shoe-images";

/**
 * Hook that returns the best available image for a product.
 * Uses stored image if available, otherwise falls back to the default.
 */
export function useShoeImage(productId: string, fallbackUrl: string): string {
  const [url, setUrl] = useState(fallbackUrl);

  useEffect(() => {
    let cancelled = false;
    getShoeImageUrl(productId).then((stored) => {
      if (!cancelled && stored) setUrl(stored);
    });
    return () => { cancelled = true; };
  }, [productId, fallbackUrl]);

  return url;
}
