type Props = {
  stack: string[];
};

export function CareerStackPills({ stack }: Props) {
  if (stack.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {stack.map((item) => (
        <li
          key={item}
          className="rounded-md border border-line bg-surface/60 px-2.5 py-1 text-xs font-medium text-ink-dim"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
