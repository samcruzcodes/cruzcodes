// Opens in a new tab; noopener/noreferrer keep the new page from messing with mine.
export default function ExternalLink({ href, children, ...rest }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <span className="visuallyHidden"> (opens in a new tab)</span>
    </a>
  );
}
