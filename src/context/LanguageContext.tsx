import React, { createContext, useState } from "react";

type Language = "en" | "hi";

interface Translations {
  [key: string]: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcome: "Welcome to Coffee Bot",
    welcomeInstructions:
      "Click the microphone button and start speaking. I'll listen and respond to what you say.",
    didntUnderstand: "I didn't understand, Can you please rephrase?",
  },
  hi: {
    welcome: "कॉफ़ी बॉट में आपका स्वागत है",
    welcomeInstructions:
      "माइक्रोफ़ोन बटन पर क्लिक करें और बोलना शुरू करें। मैं सुनूंगा और आपकी बात का जवाब दूंगा।",
    didntUnderstand: "मुझे समझ में नहीं आया, क्या आप कृपया फिर से कह सकते हैं?",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: keyof Translations) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
