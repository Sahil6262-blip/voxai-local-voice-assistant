import { Box, Moon, Sun } from "lucide-react";
export default function Header({ health, theme, onTheme }) {
  return (
    <header className="header">
      <div className="header-right">
        <span className="model-badge">
          <Box size={18} strokeWidth={1.5} />
          {health?.model || "qwen2.5:3b"}
          <span className="model-local">LOCAL</span>
        </span>
        <button
          className="icon-button"
          aria-label={
            theme === "light"
              ? "Switch to evening theme"
              : "Switch to daylight theme"
          }
          onClick={onTheme}
        >
          {theme === "light" ? (
            <Sun size={23} strokeWidth={1.4} />
          ) : (
            <Moon size={21} strokeWidth={1.5} />
          )}
        </button>
      </div>
    </header>
  );
}
