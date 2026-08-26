type Props = {
  items: string[];
};

export function CareerJdList({ items }: Props) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <li key={item} className="flex gap-3 py-3.5 text-sm leading-relaxed text-ink-dim">
          <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold/70" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
