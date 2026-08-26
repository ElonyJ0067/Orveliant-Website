type Section = {
  id: string;
  label: string;
};

type Props = {
  sections: Section[];
};

export function CareerSectionNav({ sections }: Props) {
  return (
    <nav aria-label="On this page" className="border-b border-line pb-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
        On this page
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-sm font-medium text-ink-dim transition-colors hover:text-gold-light"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
