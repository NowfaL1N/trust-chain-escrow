import Link from "next/link";
import Image from "next/image";

export function EscrowLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center hover:opacity-90 transition-opacity">
      <Image
        src="/colour-trust-chain-logo.png"
        alt="TrustChain Logo"
        width={180}
        height={54}
        className="h-12 w-auto object-contain"
      />
    </Link>
  );
}
