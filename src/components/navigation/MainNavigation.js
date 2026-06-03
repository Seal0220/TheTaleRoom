import { Archive, BookOpen, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { navigationItems } from "@/config/navigation";

const iconMap = {
  home: Home,
  stories: BookOpen,
  studio: MessageCircle,
  records: Archive,
};

export function MainNavigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-tale-ink/78 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="tale-focus flex items-center gap-3 rounded-lg">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-tale-gold/36 bg-tale-gold/12 text-tale-gold shadow-lantern">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-5 text-[#fff4d6]">
              TheTaleRoom
            </span>
            <span className="block text-xs uppercase tracking-[0.18em] text-white/48">
              Story room
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.04] p-1">
          {navigationItems.map((item) => {
            const Icon = iconMap[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                className="tale-focus inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-tale-mist transition hover:bg-white/10 hover:text-[#fff4d6]"
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
