import Link from "next/link";
import Image from "next/image";

export function EscrowLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center hover:opacity-90 transition-opacity">
      <Image
        src="/trust-chain-logo-webpe.gif"
        alt="TrustChain Logo"
        width={620}
        height={305}
        className="h-14 sm:h-16 w-[100px] sm:w-[100px] lg:w-[100px] object-contain"
      />
    </Link>
  );
}
