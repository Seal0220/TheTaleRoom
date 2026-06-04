import { ArrowLeft, ArrowRight } from "lucide-react";


export function Button({
  children,
  className = "",
  onClick,
  arrowR = false,
  arrowL = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-30 cursor-pointer inline-flex h-10 w-fit min-w-32 items-center justify-center rounded-md border border-[#f7d995]/42 bg-[#110d14]/76 px-5 text-sm font-semibold text-[#ffe9b7] transition duration-500 ease-in-out will-change-all hover:bg-tale-gold hover:text-[#130b12] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#f7d995]
        ${className}`}
    >
      {arrowL && <ArrowLeft className="mr-2 size-4" />}
      {children}
      {arrowR && <ArrowRight className="ml-2 size-4" />}
    </button>
  );
}
