import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { FAQAccordion } from '@app/components/FAQAccordion';
import { useFAQContent } from '@app/hooks/useOffersContent';
import { getIconByName } from '@app/utils/iconMapper';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Search, X, HelpCircle } from 'lucide-react';
import { Button } from '@app/components/ui/button';

export default function OffersFAQ() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: content, loading, error } = useFAQContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtrer les items selon la recherche et la catégorie
  const filteredItems = useMemo(() => {
    if (!content) return [];

    let items = content.items.filter(item => item.isActive);

    // Filtrer par catégorie
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      items = items.filter(item => {
        const question = item.question[language].toLowerCase();
        const answer = item.answer[language].toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();
        
        return question.includes(searchTerm) || 
               answer.includes(searchTerm) || 
               tags.includes(searchTerm);
      });
    }

    // Trier par displayOrder
    return items.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [content, selectedCategory, searchQuery, language]);

  // Compter les items par catégorie
  const categoryCounts = useMemo(() => {
    if (!content) return {};
    
    const counts: Record<string, number> = {};
    content.items
      .filter(item => item.isActive)
      .forEach(item => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
    
    return counts;
  }, [content]);

  // État de chargement
  if (loading) {
    return (
      <>
        <PageBanner
          icon={HelpCircle}
          title={t('faq.title')}
          subtitle={t('faq.subtitle')}
        />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  // État d'erreur
  if (error || !content) {
    return (
      <>
        <PageBanner
          icon={HelpCircle}
          title={t('faq.title')}
          subtitle={t('faq.subtitle')}
        />
        <PageContainer>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600">{t('common.error')}</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  const activeCategories = content.categories
    .filter(cat => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const hasSearchResults = filteredItems.length > 0;
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <>
      <PageBanner
        icon={HelpCircle}
        title={t('faq.title')}
        subtitle={t('faq.subtitle')}
      />
      
      <SubMenu
        items={[
          {
            label: t('nav.faq'),
            icon: HelpCircle,
            active: true,
            onClick: () => navigate('/faq'),
          },
        ]}
      />
      
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Barre de recherche */}
          {content.settings.enableSearch && (
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder={t('faq.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-10 py-6 text-base border-gray-300 focus:border-accent focus:ring-accent rounded-lg shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={t('faq.clearSearch')}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Indicateur de résultats de recherche */}
              {hasSearch && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    {filteredItems.length > 0 
                      ? t('faq.searchResults', { count: filteredItems.length })
                      : t('faq.noResults')
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Filtres par catégorie */}
          {content.settings.enableCategories && activeCategories.length > 0 && !hasSearch && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  className="transition-all duration-200"
                >
                  {t('faq.allCategories')}
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-white/20 text-inherit border-0"
                  >
                    {content.items.filter(i => i.isActive).length}
                  </Badge>
                </Button>
                
                {activeCategories.map((category) => {
                  const CategoryIcon = getIconByName(category.iconName);
                  const count = categoryCounts[category.id] || 0;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <Button
                      key={category.id}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="transition-all duration-200"
                    >
                      <CategoryIcon className="h-4 w-4 mr-2" />
                      {category.name[language]}
                      <Badge 
                        variant="secondary" 
                        className={`ml-2 ${isSelected ? 'bg-white/20 text-inherit' : ''} border-0`}
                      >
                        {count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Liste des questions par catégorie */}
          {!hasSearch && selectedCategory === null ? (
            // Afficher toutes les catégories avec leurs questions
            <div className="space-y-12">
              {activeCategories.map((category) => {
                const CategoryIcon = getIconByName(category.iconName);
                const categoryItems = content.items
                  .filter(item => item.isActive && item.category === category.id)
                  .sort((a, b) => a.displayOrder - b.displayOrder);

                if (categoryItems.length === 0) return null;

                return (
                  <div key={category.id} className="scroll-mt-24" id={`category-${category.id}`}>
                    {/* En-tête de catégorie */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-gradient-to-br from-accent to-red-600 p-3 rounded-lg flex-shrink-0">
                        <CategoryIcon className="h-6 w-6 text-white" strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-primary mb-1">
                          {category.name[language]}
                        </h2>
                        {category.description && (
                          <p className="text-sm text-gray-600">
                            {category.description[language]}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {categoryItems.length}
                      </Badge>
                    </div>

                    {/* Questions de la catégorie */}
                    <FAQAccordion items={categoryItems} />
                  </div>
                );
              })}
            </div>
          ) : (
            // Afficher les résultats filtrés (recherche ou catégorie sélectionnée)
            <div>
              {selectedCategory && !hasSearch && (
                <div className="mb-6">
                  {(() => {
                    const category = activeCategories.find(c => c.id === selectedCategory);
                    if (!category) return null;
                    
                    const CategoryIcon = getIconByName(category.iconName);
                    
                    return (
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-accent to-red-600 p-3 rounded-lg flex-shrink-0">
                          <CategoryIcon className="h-6 w-6 text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-primary mb-1">
                            {category.name[language]}
                          </h2>
                          {category.description && (
                            <p className="text-sm text-gray-600">
                              {category.description[language]}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {filteredItems.length}
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {hasSearchResults ? (
                <FAQAccordion items={filteredItems} />
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {t('faq.noResults')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {t('faq.noResultsDescription')}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    {t('faq.resetFilters')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Section de contact pour questions non résolues */}
          <div className="mt-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-8 text-center border border-gray-200">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-accent" strokeWidth={1.5} />
            <h3 className="text-xl font-bold text-primary mb-2">
              {t('faq.stillHaveQuestions')}
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-xl mx-auto">
              {t('faq.contactDescription')}
            </p>
            <Button
              onClick={() => navigate('/contact')}
              variant="default"
              className="bg-accent hover:bg-accent/90"
            >
              {t('faq.contactUs')}
            </Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}