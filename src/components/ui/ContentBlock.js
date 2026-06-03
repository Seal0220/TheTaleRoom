import { cx } from "@/lib/classNames";

export function ContentBlock({ children, className }) {
  return (
    <section className={cx("tale-panel rounded-lg p-5", className)}>
      {children}
    </section>
  );
}
