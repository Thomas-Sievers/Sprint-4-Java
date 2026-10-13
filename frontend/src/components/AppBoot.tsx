import { useEffect, useState, type ReactNode } from "react";
import { BrandLoader } from "./BrandLoader";

const MAX_WAIT_MS = 1200;

export function AppBoot({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT_MS));

    Promise.race([fontsReady, timeout]).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <BrandLoader size={140} />
      </div>
    );
  }

  return <>{children}</>;
}
