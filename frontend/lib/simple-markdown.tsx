import type { ReactNode } from "react";

function inlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(<strong key={`${match.index}-${match[1]}`}>{match[1]}</strong>);
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }
  return parts.length ? parts : [text];
}

/** Minimal markdown for instruction copy (bold + lists + paragraphs). */
export function SimpleMarkdown({ content }: { content: string }) {
  const blocks = content.trim().split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^[-*]\s/.test(line.trim()) || line.trim() === "");

        if (isList && lines.some((l) => /^[-*]\s/.test(l.trim()))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {lines
                .filter((line) => /^[-*]\s/.test(line.trim()))
                .map((line, j) => (
                  <li key={j}>{inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
                ))}
            </ul>
          );
        }

        if (/^\d+\.\s/.test(lines[0]?.trim() ?? "")) {
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-5">
              {lines
                .filter((line) => /^\d+\.\s/.test(line.trim()))
                .map((line, j) => (
                  <li key={j}>
                    {inlineMarkdown(line.replace(/^\d+\.\s+/, ""))}
                  </li>
                ))}
            </ol>
          );
        }

        return (
          <p key={i} className="text-pretty">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 ? <br /> : null}
                {inlineMarkdown(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
