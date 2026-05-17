import { TerminalCard } from "@/_features/member-desk/terminal-card";

type Props = {
  title: string;
  bullets: string[];
  accent?: "teal" | "amber" | "violet" | "slate";
};

export function DeskSectionPlaceholder({ title, bullets, accent = "slate" }: Props) {
  return (
    <TerminalCard title={title} subtitle="Module scaffold — wire APIs + Supabase rows next" accent={accent}>
      <ul className="list-disc space-y-2 pl-4 text-sm text-phronis-muted">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </TerminalCard>
  );
}
