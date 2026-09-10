import { useEffect } from "react";

/** Apply the `dark` class on <html> for the whole app (Lovable replica is dark-first). */
export function useDarkMode(enabled = true) {
  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [enabled]);
}
