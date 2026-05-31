import { Loader2, CloudSun } from "lucide-react";

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/80 to-white/80 dark:from-slate-950/80 dark:to-slate-900/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="relative flex items-center justify-center w-24 h-24 mb-4">
          <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/20 rounded-full blur-xl animate-pulse" />
          <CloudSun className="w-16 h-16 text-blue-500 dark:text-blue-400 drop-shadow-lg relative z-10 animate-bounce" />
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="font-semibold text-lg tracking-wide">Loading Weather...</span>
        </div>
      </div>
    </div>
  );
}
