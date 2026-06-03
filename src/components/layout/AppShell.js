import { MainNavigation } from "@/components/navigation/MainNavigation";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#090b14_0%,#12172a_46%,#080b14_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(232,196,125,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(232,196,125,0.045)_1px,transparent_1px)] bg-size-[64px_64px] opacity-36" />
      <div className="relative">
        <MainNavigation />
        {children}
      </div>
    </div>
  );
}
