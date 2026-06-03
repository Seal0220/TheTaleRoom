import { MainNavigation } from "@/components/navigation/MainNavigation";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#090b14_0%,#12172a_46%,#080b14_100%)]">
      <div className="pointer-events-none fixed inset-0 opacity-36 [background-image:linear-gradient(rgba(232,196,125,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(232,196,125,0.045)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="relative">
        <MainNavigation />
        {children}
      </div>
    </div>
  );
}
