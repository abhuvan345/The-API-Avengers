import React, { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { languageOptions } from "../hooks/useLanguage";

const LanguageDropdown: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = languageOptions.find(
    (option) => option.code === currentLanguage
  );

  const handleLanguageChange = (languageCode: "en" | "hi" | "kn") => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded="true"
          aria-haspopup="true"
        >
          <Globe className="w-4 h-4 mr-2" />
          {currentOption?.nativeName}
          <ChevronDown className="w-4 h-4 ml-2" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {languageOptions.map((option) => (
              <button
                key={option.code}
                className={`${
                  currentLanguage === option.code
                    ? "bg-green-100 text-green-900"
                    : "text-gray-700"
                } group flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 hover:text-gray-900`}
                role="menuitem"
                onClick={() => handleLanguageChange(option.code)}
              >
                <span className="mr-3 text-lg">{option.nativeName}</span>
                <span className="text-gray-500">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default LanguageDropdown;
