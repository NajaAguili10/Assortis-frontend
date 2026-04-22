import { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { ContactDialog } from '@app/components/ContactDialog';
import { ExpertInviteDialog } from '@app/components/ExpertInviteDialog';
import {
  Headphones,
  LayoutDashboard,
  Search,
  FileText,
  Handshake,
  BookOpen,
  Users,
  Star,
  MapPin,
  Mail,
  Send,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  title: string;
  photo: string;
  rating: number;
  experience: number;
  expertise: string[];
  languages: string[];
  location: string;
  availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  dailyRate: number;
  completedAssignments: number;
  workMode: string[];
}

export default function AssistanceRequestSupport() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'rate' | 'availability'>('rating');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedWorkMode, setSelectedWorkMode] = useState<string[]>([]);
  const [minExperience, setMinExperience] = useState(0);
  const [maxExperience, setMaxExperience] = useState(50);
  const [minRate, setMinRate] = useState(0);
  const [maxRate, setMaxRate] = useState(2000);

  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  // Mock data - experts
  const experts: Expert[] = [
    {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      title: 'Senior Methodological Advisor',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      rating: 4.9,
      experience: 15,
      expertise: ['Project Management', 'Sustainable Development', 'Climate Change'],
      languages: ['English', 'Français', 'Español'],
      location: 'Brussels, Belgium',
      availability: 'AVAILABLE',
      dailyRate: 850,
      completedAssignments: 142,
      workMode: ['Remote', 'On Site'],
    },
    {
      id: '2',
      name: 'Ahmed El-Sayed',
      title: 'Graphic Design Specialist',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      rating: 4.8,
      experience: 12,
      expertise: ['Graphic Design', 'Communication', 'Development Cooperation'],
      languages: ['English', 'العربية', 'Français'],
      location: 'Cairo, Egypt',
      availability: 'LIMITED',
      dailyRate: 720,
      completedAssignments: 98,
      workMode: ['Remote'],
    },
    {
      id: '3',
      name: 'María González',
      title: 'Gender Equality & Inclusion Expert',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      rating: 4.9,
      experience: 18,
      expertise: ['Gender Equality', 'Social Inclusion', 'Human Rights'],
      languages: ['Español', 'English', 'Français'],
      location: 'Madrid, Spain',
      availability: 'AVAILABLE',
      dailyRate: 900,
      completedAssignments: 167,
      workMode: ['Remote', 'On Site'],
    },
    {
      id: '4',
      name: 'Jean-Paul Dubois',
      title: 'Water & Sanitation Engineer',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      rating: 4.7,
      experience: 20,
      expertise: ['Water and Sanitation', 'Engineering', 'Public Health'],
      languages: ['Français', 'English'],
      location: 'Paris, France',
      availability: 'LIMITED',
      dailyRate: 980,
      completedAssignments: 203,
      workMode: ['On Site'],
    },
    {
      id: '5',
      name: 'Dr. Amina Okoye',
      title: 'Public Health & Nutrition Consultant',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
      rating: 4.9,
      experience: 14,
      expertise: ['Public Health', 'Nutrition', 'Governance'],
      languages: ['English', 'Français'],
      location: 'Nairobi, Kenya',
      availability: 'AVAILABLE',
      dailyRate: 800,
      completedAssignments: 156,
      workMode: ['Remote', 'On Site'],
    },
    {
      id: '6',
      name: 'Carlos Mendoza',
      title: 'Climate Change & Sustainability Expert',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      rating: 4.8,
      experience: 16,
      expertise: ['Climate Change', 'Sustainable Development', 'Development Cooperation'],
      languages: ['Español', 'English'],
      location: 'Bogotá, Colombia',
      availability: 'AVAILABLE',
      dailyRate: 870,
      completedAssignments: 134,
      workMode: ['Remote'],
    },
  ];

  const expertiseAreas = [
    'Development Cooperation',
    'Project Management',
    'Sustainable Development',
    'Climate Change',
    'Governance',
    'Human Rights',
    'Public Health',
    'Nutrition',
    'Gender Equality',
    'Social Inclusion',
    'Water and Sanitation',
    'Engineering',
    'Graphic Design',
    'Communication',
  ];

  const languages = ['Français', 'English', 'Español', 'العربية'];

  const toggleFilter = (value: string, array: string[], setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'LIMITED':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'UNAVAILABLE':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAndSortedExperts = experts
    .filter(expert => {
      if (searchQuery && !expert.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !expert.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (selectedExpertise.length > 0 && !selectedExpertise.some(e => expert.expertise.includes(e))) {
        return false;
      }
      if (selectedLanguages.length > 0 && !selectedLanguages.some(l => expert.languages.includes(l))) {
        return false;
      }
      if (selectedAvailability.length > 0 && !selectedAvailability.includes(expert.availability)) {
        return false;
      }
      if (selectedWorkMode.length > 0 && !selectedWorkMode.some(m => expert.workMode.includes(m))) {
        return false;
      }
      if (expert.experience < minExperience || expert.experience > maxExperience) {
        return false;
      }
      if (expert.dailyRate < minRate || expert.dailyRate > maxRate) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'rate':
          return a.dailyRate - b.dailyRate;
        case 'availability':
          return a.availability.localeCompare(b.availability);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('assistance.requestSupport.title')}
        description={t('assistance.requestSupport.subtitle')}
        icon={Users}
        stats={[
          { value: filteredAndSortedExperts.length.toString(), label: t('assistance.requestSupport.expertsFound') }
        ]}
      />

      {/* Sub Menu */}
      <SubMenu
        items={[
          { label: t('assistance.submenu.findExpert'), icon: Search, onClick: () => navigate('/assistance/find-expert') },
          { label: t('assistance.submenu.request'), icon: FileText, onClick: () => navigate('/assistance/request') },
          { label: t('assistance.submenu.history'), icon: Clock, onClick: () => navigate('/assistance/history') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
                <div className="flex items-center gap-2 mb-5">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-primary">Filtres</h3>
                </div>

                {/* Search */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('assistance.requestSupport.searchPlaceholder')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('assistance.requestSupport.searchPlaceholder')}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Expertise Areas */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <label className="block text-sm font-medium text-primary mb-3">
                    {t('assistance.filters.expertise')}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {expertiseAreas.map((area) => (
                      <label key={area} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedExpertise.includes(area)}
                          onChange={() => toggleFilter(area, selectedExpertise, setSelectedExpertise)}
                          className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <label className="block text-sm font-medium text-primary mb-3">
                    {t('assistance.filters.language')}
                  </label>
                  <div className="space-y-2">
                    {languages.map((lang) => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedLanguages.includes(lang)}
                          onChange={() => toggleFilter(lang, selectedLanguages, setSelectedLanguages)}
                          className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Years of Experience */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <label className="block text-sm font-medium text-primary mb-3">
                    {t('assistance.filters.experience')}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('assistance.filters.minimum')}</label>
                      <input
                        type="number"
                        value={minExperience}
                        onChange={(e) => setMinExperience(Number(e.target.value))}
                        min="0"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('assistance.filters.maximum')}</label>
                      <input
                        type="number"
                        value={maxExperience}
                        onChange={(e) => setMaxExperience(Number(e.target.value))}
                        min="0"
                        max="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <label className="block text-sm font-medium text-primary mb-3">
                    {t('assistance.filters.availability')}
                  </label>
                  <div className="space-y-2">
                    {['AVAILABLE', 'LIMITED', 'UNAVAILABLE'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedAvailability.includes(status)}
                          onChange={() => toggleFilter(status, selectedAvailability, setSelectedAvailability)}
                          className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {status === 'AVAILABLE' ? t('assistance.availability.AVAILABLE') :
                           status === 'LIMITED' ? t('assistance.filters.limited') :
                           t('assistance.availability.UNAVAILABLE')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Mode */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <label className="block text-sm font-medium text-primary mb-3">
                    {t('assistance.filters.workMode')}
                  </label>
                  <div className="space-y-2">
                    {['Remote', 'On Site'].map((mode) => (
                      <label key={mode} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedWorkMode.includes(mode)}
                          onChange={() => toggleFilter(mode, selectedWorkMode, setSelectedWorkMode)}
                          className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {mode === 'Remote' ? t('assistance.filters.remote') : t('assistance.filters.onsite')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Daily Rate */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-primary mb-3">
                    {t('assistance.filters.dailyRate')}
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('assistance.filters.minimum')}</label>
                      <input
                        type="number"
                        value={minRate}
                        onChange={(e) => setMinRate(Number(e.target.value))}
                        min="0"
                        max="2000"
                        step="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{t('assistance.filters.maximum')}</label>
                      <input
                        type="number"
                        value={maxRate}
                        onChange={(e) => setMaxRate(Number(e.target.value))}
                        min="0"
                        max="2000"
                        step="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedExpertise([]);
                    setSelectedLanguages([]);
                    setSelectedAvailability([]);
                    setSelectedWorkMode([]);
                    setMinExperience(0);
                    setMaxExperience(50);
                    setMinRate(0);
                    setMaxRate(2000);
                  }}
                  className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('assistance.filters.clear')}
                </button>
              </div>
            </div>

            {/* Experts List */}
            <div className="lg:col-span-3">
              {/* Sort Controls */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-primary">{filteredAndSortedExperts.length}</span> {t('assistance.requestSupport.expertsFound')}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{t('assistance.requestSupport.sortBy')}</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="rating">{t('assistance.requestSupport.sortRating')}</option>
                    <option value="experience">{t('assistance.requestSupport.sortExperience')}</option>
                    <option value="rate">{t('assistance.requestSupport.sortRate')}</option>
                    <option value="availability">{t('assistance.requestSupport.sortAvailability')}</option>
                  </select>
                </div>
              </div>

              {/* Expert Cards */}
              <div className="space-y-4">
                {filteredAndSortedExperts.map((expert) => (
                  <div key={expert.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Expert Photo */}
                      <div className="flex-shrink-0">
                        <img
                          src={expert.photo}
                          alt={expert.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </div>

                      {/* Expert Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-lg text-primary">{expert.name}</h3>
                            <p className="text-sm text-gray-600">{expert.title}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(expert.availability)}`}>
                            {expert.availability === 'AVAILABLE' ? t('assistance.availability.AVAILABLE') :
                             expert.availability === 'LIMITED' ? t('assistance.filters.limited') :
                             t('assistance.availability.UNAVAILABLE')}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{expert.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{expert.location}</span>
                          </div>
                          <div>
                            <span className="font-medium">{expert.experience}</span> {t('assistance.requestSupport.yearsExp')}
                          </div>
                          <div>
                            <span className="font-medium">{expert.completedAssignments}</span> {t('assistance.requestSupport.assignments')}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {expert.expertise.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {expert.expertise.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{expert.expertise.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
                          <span className="font-medium">{t('assistance.expert.languages')}:</span>
                          {expert.languages.map((lang, idx) => (
                            <span key={idx}>{lang}{idx < expert.languages.length - 1 ? ',' : ''}</span>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-lg font-bold text-primary">
                            €{expert.dailyRate}<span className="text-sm font-normal text-gray-600">{t('assistance.requestSupport.perDay')}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="px-4 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                              onClick={() => {
                                setSelectedExpert(expert);
                                setContactDialogOpen(true);
                              }}
                            >
                              <Mail className="w-4 h-4" />
                              {t('assistance.actions.contact')}
                            </button>
                            <button
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                              onClick={() => {
                                setSelectedExpert(expert);
                                setInviteDialogOpen(true);
                              }}
                            >
                              <Send className="w-4 h-4" />
                              {t('assistance.actions.sendInvitation')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAndSortedExperts.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    {t('assistance.findExpert.noResults')}
                  </h3>
                  <p className="text-gray-500">
                    {t('assistance.findExpert.noResults.message')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Contact Dialog */}
      <ContactDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        expert={selectedExpert ? { id: selectedExpert.id, name: selectedExpert.name } : null}
      />

      {/* Invite Dialog */}
      <ExpertInviteDialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        expertName={selectedExpert?.name || ''}
        expertId={selectedExpert?.id || ''}
        expertPhoto={selectedExpert?.photo || ''}
        expertTitle={selectedExpert?.title || ''}
      />
    </div>
  );
}