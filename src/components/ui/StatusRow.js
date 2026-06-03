import { cx } from "@/lib/classNames";

export function StatusRow({ label, value, className }) {
  return (
    <div className={cx("flex items-center justify-between gap-4", className)}>
      <span className="text-sm text-white/54">{label}</span>
      <span className="text-sm font-semibold text-[#fff4d6]">{value}</span>
    </div>
  );
}
