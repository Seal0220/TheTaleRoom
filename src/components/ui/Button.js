import Link from "next/link";
import { cx } from "@/lib/classNames";

const variantClassNames = {
  primary:
    "border-tale-gold bg-tale-gold text-tale-ink hover:bg-[#f4d58f] disabled:border-white/12 disabled:bg-white/12 disabled:text-white/32",
  secondary:
    "border-white/14 bg-white/8 text-[#fff4d6] hover:border-tale-gold/60 hover:bg-tale-gold/12 disabled:text-white/32",
  ghost:
    "border-white/12 bg-tale-ink/46 text-[#fff4d6] hover:border-tale-gold/60 hover:bg-white/10 disabled:text-white/32",
};

export function Button({
  children,
  className,
  href,
  variant = "primary",
  type = "button",
  ...props
}) {
  const classNames = cx(
    "tale-focus inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition disabled:cursor-not-allowed",
    variantClassNames[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classNames} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classNames} {...props}>
      {children}
    </button>
  );
}
