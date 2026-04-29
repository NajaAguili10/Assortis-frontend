import { useState } from 'react';
import { Search, FileText, Users, Building2, TrendingUp, X } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'tender' | 'expert' | 'organization' | 'project';
  date?: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Appel d\'offres - Développement durable en Afrique',
    description: 'Projet de développement agricole avec budget de €500K',
    type: 'tender',
    date: '2 jours'
  },
  {
    id: '2',
    title: 'Expert en gestion de projets internationaux',
    description: 'Spécialiste avec 15 ans d\'expérience en coopération',
    type: 'expert',
  },
  {
    id: '3',
    title: 'Organisation internationale ABC',
    description: 'ONG active dans 25 pays avec focus développement',
    type: 'organization',
  },
  {
    id: '4',
    title: 'Projet de formation en santé publique',
    description: 'Programme de renforcement des capacités - Budget €250K',
    type: 'project',
    date: '5 jours'
  },
];

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      // Simulate API call
      setTimeout(() => {
        setResults(mockResults.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        ));
        setIsSearching(false);
      }, 300);
    } else {
      setResults([]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tender':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'expert':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'organization':
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case 'project':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      default:
        return <Search className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tender':
        return 'Appel d\'offres';
      case 'expert':
        return 'Expert';
      case 'organization':
        return 'Organisation';
      case 'project':
        return 'Projet';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="sr-only">Recherche Assortis</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des appels d'offres, experts, organisations..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
          {searchQuery.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Commencez à taper pour rechercher</p>
            </div>
          )}

          {searchQuery.length > 0 && searchQuery.length <= 2 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tapez au moins 3 caractères</p>
            </div>
          )}

          {isSearching && (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Recherche en cours...</p>
            </div>
          )}

          {!isSearching && results.length === 0 && searchQuery.length > 2 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun résultat trouvé pour "{searchQuery}"</p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </p>
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                  onClick={() => {
                    onClose();
                    toast.info(`Navigation vers ${result.title}`);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {getTypeLabel(result.type)}
                        </span>
                        {result.date && (
                          <span className="text-xs text-gray-500">Il y a {result.date}</span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                        {result.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
