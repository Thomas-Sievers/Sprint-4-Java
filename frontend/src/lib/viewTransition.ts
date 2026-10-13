import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import type { NavigateFunction, NavigateOptions } from "react-router-dom";

export function withViewTransition(update: () => void): void {
  if (typeof document === "undefined" || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(() => {
    flushSync(update);
  });
}

export function createTransitionClickHandler(
  navigate: NavigateFunction,
  to: string,
  options?: NavigateOptions,
) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    withViewTransition(() => navigate(to, options));
  };
}
