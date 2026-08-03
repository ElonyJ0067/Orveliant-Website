import { SITE } from "@/lib/site";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S.02 4.881.02 3.5C.02 2.12 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.25h4.56V23H.22V8.25zM8.34 8.25h4.37v2.01h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.47 3.04 5.47 7v8.1h-4.56v-7.18c0-1.71-.03-3.91-2.38-3.91-2.39 0-2.75 1.86-2.75 3.79V23H8.34V8.25z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .3a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 .3z" />
    </svg>
  );
}

const items = [
  {
    label: "LinkedIn",
    href: SITE.social.linkedin,
    Icon: LinkedInIcon,
  },
  {
    label: "GitHub",
    href: SITE.social.github,
    Icon: GitHubIcon,
  },
] as const;

type SocialLinksProps = {
  className?: string;
};

export function SocialLinks({ className = "" }: SocialLinksProps) {
  return (
    <nav aria-label="Social media" className={`flex items-center gap-2.5 ${className}`}>
      {items.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} (opens in a new tab)`}
          className="group inline-flex h-10 w-10 items-center justify-center rounded-[0.7rem] border border-line bg-white/[0.02] text-ink-mute transition-[border-color,background-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold/[0.06] hover:text-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold/65"
        >
          <Icon className="h-[18px] w-[18px] transition-transform duration-200 ease-out group-hover:scale-105" />
        </a>
      ))}
    </nav>
  );
}
