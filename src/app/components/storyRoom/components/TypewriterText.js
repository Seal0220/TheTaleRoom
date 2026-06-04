export function TypewriterText({
  className = "",
  delayStep = 18,
  initialDelay = 80,
  style,
  text,
}) {
  const characters = Array.from(text || "");

  return (
    <p
      aria-label={text}
      className={className}
      style={{
        ...style,
        overflowWrap: "anywhere",
        whiteSpace: "pre-wrap",
      }}
    >
      {characters.map((character, index) => (
        <span
          aria-hidden="true"
          className="story-type-char"
          key={`${character}-${index}`}
          style={{ animationDelay: `${initialDelay + index * delayStep}ms` }}
        >
          {character}
        </span>
      ))}
    </p>
  );
}
