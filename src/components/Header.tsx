import React from "react";
import { Mic, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface HeaderProps {
  toggleSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSettings }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mic className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Coffee Bot
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-gray-200" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          <button
            onClick={toggleSettings}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Open settings"
          >
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
