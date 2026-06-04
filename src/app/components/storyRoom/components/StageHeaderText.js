export function StageHeaderText({ activeStageIndex, className = "", items }) {
  const longestItem = items.reduce(
    (currentLongest, item) =>
      item.length > currentLongest.length ? item : currentLongest,
    "",
  );

  return (
    <span className={`relative inline-grid min-w-0 ${className}`}>
      <span className="invisible col-start-1 row-start-1">
        {longestItem}
      </span>
      {items.map((item, index) => (
        <span
          className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out
            ${index === activeStageIndex ? "translate-y-0 opacity-100 blur-0" : index < activeStageIndex ? "-translate-y-2 opacity-0 blur-[2px]" : "translate-y-2 opacity-0 blur-[2px]"}`}
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </span>
  );
}
