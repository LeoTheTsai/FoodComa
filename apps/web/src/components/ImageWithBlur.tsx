import React, { useEffect, useMemo, useState } from "react";

type Props = {
  srcs: Array<string | null | undefined>;
  alt: string;
  blurDataURL?: string | null;
  className?: string;
  imgClassName?: string;
};

export default function ImageWithBlur({ srcs, alt, blurDataURL, className = "", imgClassName = "" }: Props) {
  const validSrcs = useMemo(() => (srcs || []).filter(Boolean) as string[], [srcs]);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);

  const src = validSrcs[idx] || "";

  useEffect(() => { setLoaded(false); setFallback(false); }, [idx, src]);

  const onError = () => {
    if (idx < validSrcs.length - 1) setIdx(i => i + 1);
    else setFallback(true);
  };

  const onLoad = () => setLoaded(true);

  // wrapper uses background-image with blurDataURL if provided
  const bgStyle = blurDataURL ? { backgroundImage: `url(${blurDataURL})` } : undefined;
  const bgClasses = blurDataURL ? "bg-cover bg-center" : "bg-gray-100";

  return (
    <div
      className={`relative overflow-hidden ${bgClasses} ${className}`}
      style={bgStyle}
    >
      {!blurDataURL && !fallback && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}
      {!fallback && !!src && (
        <img
          src={src}
          alt={alt}
          onLoad={onLoad}
          onError={onError}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-md"} ${imgClassName}`}
        />
      )}
      {fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 13.5l2.25-2.25a1.5 1.5 0 012.121 0l4.629 4.629M7.5 8.25h.008v.008H7.5V8.25z" />
          </svg>
        </div>
      )}
    </div>
  );
}
