export function ContentBlock({ children, className = "" }) {
  return (
    <section
      className={`tale-panel rounded-lg p-5
        ${className}`}
    >
      {children}
    </section>
  );
}
