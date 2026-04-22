import React, { useState } from 'react';
import { ChevronDown, Mail } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { FAQItem } from '../types/faq.types';

interface FAQAccordionProps {
  items: FAQItem[];
  defaultExpanded?: string | null;
}

export function FAQAccordion({ items, defaultExpanded = null }: FAQAccordionProps) {
  const { language } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(defaultExpanded);

  const toggleItem = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Fonction pour rendre les emails cliquables dans les réponses
  const renderAnswer = (answer: string) => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const parts = answer.split(emailRegex);
    
    return parts.map((part, index) => {
      if (part.match(emailRegex)) {
        return (
          <a
            key={index}
            href={`mailto:${part}`}
            className="text-accent hover:underline inline-flex items-center gap-1 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-md"
          >
            {/* Question - Clickable header */}
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-gray-50"
              aria-expanded={isExpanded}
              aria-controls={`faq-answer-${item.id}`}
            >
              <h3 className="text-base font-semibold text-primary pr-4 flex-1">
                {item.question[language]}
              </h3>
              
              <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="h-5 w-5 text-gray-400" strokeWidth={2} />
              </div>
            </button>

            {/* Answer - Expandable content */}
            <div
              id={`faq-answer-${item.id}`}
              className={`transition-all duration-300 ease-in-out ${
                isExpanded 
                  ? 'max-h-[1000px] opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-6 pb-5 pt-1">
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {renderAnswer(item.answer[language])}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}