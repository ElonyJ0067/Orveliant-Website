import Image from "next/image";

export function CoinIcon({
  symbol,
  size = 20,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/coins/${symbol.toLowerCase()}.png`}
      alt={symbol}
      width={size}
      height={size}
      unoptimized
      className={`rounded-full object-cover ${className}`}
    />
  );
}
