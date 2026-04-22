import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, Language } from '../contexts/LanguageContext';
import { Button } from './ui/button';

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'es', label: 'Español', flag: 'ES' },
  ];

  const currentLanguage = languages.find((l) => l.code === language);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-1 h-9 px-2 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="text-sm font-medium">
          {currentLanguage?.flag || 'FR'}
        </span>
        <ChevronDown className="h-3 w-3" strokeWidth={2} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md border border-gray-200 shadow-lg z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-gray-100 transition-colors cursor-pointer text-left"
            >
              <span className="text-sm">{lang.label}</span>
              {language === lang.code && (
                <Check className="h-4 w-4 text-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
