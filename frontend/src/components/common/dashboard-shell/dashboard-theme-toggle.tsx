import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardTheme = "light" | "dark";

const DASHBOARD_THEME_STORAGE_KEY = "field-service-dashboard-theme";

function getInitialTheme(): DashboardTheme {
  const storedTheme = localStorage.getItem(
    DASHBOARD_THEME_STORAGE_KEY,
  );

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function DashboardThemeToggle() {
  const [theme, setTheme] =
    useState<DashboardTheme>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;

    localStorage.setItem(
      DASHBOARD_THEME_STORAGE_KEY,
      theme,
    );

    return () => {
      root.classList.remove("dark");
      root.style.removeProperty("color-scheme");
    };
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark",
    );
  }

  return (
    <Button
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
      onClick={toggleTheme}
      size="icon-lg"
      title={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      type="button"
      variant="ghost"
    >
      {theme === "dark" ? (
        <Sun
          aria-hidden="true"
          className="transition-transform duration-300 group-hover/button:rotate-45 motion-reduce:transform-none motion-reduce:transition-none"
        />
      ) : (
        <Moon
          aria-hidden="true"
          className="transition-transform duration-300 group-hover/button:-rotate-12 motion-reduce:transform-none motion-reduce:transition-none"
        />
      )}
    </Button>
  );
}