import Image from "next/image";

/** Square About hero — clean product visual, same treatment as Security / How it works. */
export function AboutHeroVisual() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-canvas">
      <Image
        src="/images/desk-visual.webp"
        alt="Orveliant Intelligence Desk — market structure and disciplined execution view"
        fill
        priority
        quality={92}
        sizes="(max-width: 1024px) 420px, 480px"
        className="about-hero-art object-cover object-center"
      />
    </div>
  );
}
