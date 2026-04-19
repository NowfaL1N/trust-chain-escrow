import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  // Use regular img for blob URLs, Next.js Image for remote URLs
  const isBlob = src.startsWith('blob:');
  
  if (isBlob) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={src} 
        alt={alt} 
        className={className}
        style={{ width, height }}
      />
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}