import ExternalLink from "./ExternalLink";

// Turns a string, or a mix of strings + { text, href } links, into text with real links.
export default function RichText({ parts }) {
  if (!Array.isArray(parts)) return parts;

  return parts.map((part, i) =>
    typeof part === "string" ? (
      part
    ) : (
      <ExternalLink key={i} className="inlineLink" href={part.href}>
        {part.text}
      </ExternalLink>
    )
  );
}
