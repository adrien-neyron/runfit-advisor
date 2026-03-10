import { useState } from "react";

interface ShoeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Image produit avec fallback automatique si l'URL est cassée.
 * Affiche un placeholder avec le nom du produit en cas d'erreur.
 */
export default function ShoeImage({ src, alt, className, loading = "lazy" }: ShoeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 text-muted-foreground bg-secondary/50 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 14l3-7h12l3 7" />
          <path d="M2 14h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4z" />
          <path d="M8 14v4" />
          <path d="M12 14v4" />
          <path d="M16 14v4" />
          <path d="M6 7l1-4h10l1 4" />
        </svg>
        <span className="text-xs text-center px-2 leading-tight">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
