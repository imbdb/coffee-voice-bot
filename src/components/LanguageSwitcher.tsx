import React from "react";
import { useLanguage } from "../hooks/useLanguage";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
      className="px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-sm border border-gray-300 dark:border-gray-600"
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
  );
};

export default LanguageSwitcher;
