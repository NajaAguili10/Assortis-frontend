import { Link, useLocation, useNavigate } from 'react-router';
import { 
  Search, 
  Bell, 
  User, 
  FileText, 
  BarChart3, 
  PieChart,
  Users, 
  Building2, 
  Headphones, 
  GraduationCap, 
  Gift, 
  Briefcase, 
  ShoppingCart,
  LogOut, 
  UserCircle,
  HelpCircle,
  Menu,
   X,
   Target
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState, useEffect, useMemo, useRef } from 'react';
import { NotificationPanel } from './NotificationPanel';
import { useNotificationsContext } from '../contexts/NotificationsContext';
import { LanguageSelector } from './LanguageSelector';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet';
import { useTrainingCommerce } from '../contexts/TrainingCommerceContext';
import logoImage from '../../assets/6cb2c08144ed99fcebd9949f360b4ab7cff267f4.png';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { kpis } = useNotificationsContext();
  const { cartItems, cartCount, cartTotal, removeFromCart } = useTrainingCommerce();
  const { isAuthenticated, user, logout } = useAuth();
  const { hasAccess } = useFeatureAccess();

  // Navigation items
  const navItems = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { path: '/services/projects', label: t('nav.publicProjects'), icon: BarChart3 },
        { path: '/services/organization/matching-projects', label: t('nav.publicOrganization'), icon: Building2 },
        { path: '/services/experts/matching-opportunities', label: t('nav.publicExperts'), icon: Users },
        { path: '/services/posting-board', label: t('nav.publicPostingBoard'), icon: Briefcase },
        { path: '/services/training', label: t('nav.publicTraining'), icon: GraduationCap },
      ];
    }

    return [
      ...(user?.accountType === 'expert'
        ? [{ path: '/matching-opportunities', label: t('matching-opportunities.page.title'), icon: Target }]
        : [{ path: '/calls', label: t('nav.calls'), icon: FileText }]),
      { path: '/projects', label: t('nav.projects'), icon: BarChart3 },
      { path: '/search', label: t('nav.search') || 'Search', icon: Search },
      ...(isAuthenticated ? [{ path: '/statistics', label: t('nav.statistics'), icon: PieChart }] : []),
      ...(user?.accountType !== 'expert' ? [{ path: '/posting-board', label: 'Posting Board', icon: Briefcase }] : []),
      { path: '/training', label: t('nav.training'), icon: GraduationCap },
      ...(user?.accountType === 'expert'
        ? [{ path: '/experts/my-cv/dashboard', label: t('nav.myCV'), icon: FileText }]
        : []),
      ...(user?.accountType !== 'expert'
        ? [{ path: '/organizations', label: t('nav.myOrganization'), icon: Building2 }]
        : []),
    ];
  }, [t, isAuthenticated, user?.accountType]);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Only navigate to search if user has access
        if (hasAccess) {
          navigate('/search');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, hasAccess]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Navigate to profile
  const handleProfileClick = () => {
    setUserMenuOpen(false);
    navigate('/compte-utilisateur');
  };

  const handleFAQClick = () => {
    setUserMenuOpen(false);
    navigate('/faq');
  };

  // Handle logout
  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/about" className="flex items-center flex-shrink-0 mr-12">
            <img 
              src={logoImage} 
              alt="Assortis - The International Cooperation Platform" 
              className="h-8 sm:h-10 w-auto" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              let isActive = false;
              
              if (item.path === '/calls') {
                isActive = 
                  location.pathname === '/' || 
                  location.pathname === '/calls' || 
                  location.pathname.startsWith('/calls/') ||
                  location.pathname === '/tenders' ||
                  location.pathname.startsWith('/tenders/');
              } else if (item.path === '/services/projects') {
                isActive = location.pathname.startsWith('/services/projects');
              } else if (item.path === '/services/organization/matching-projects') {
                isActive = location.pathname.startsWith('/services/organization');
              } else if (item.path === '/services/experts/matching-opportunities') {
                isActive = location.pathname.startsWith('/services/experts');
              } else if (item.path === '/services/posting-board') {
                isActive = location.pathname.startsWith('/services/posting-board');
              } else if (item.path === '/services/training') {
                isActive = location.pathname.startsWith('/services/training');
              } else if (item.path === '/experts/my-cv/dashboard') {
                isActive = location.pathname.startsWith('/experts/my-cv');
              } else {
                isActive = location.pathname.startsWith(item.path);
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 px-2 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'text-accent bg-secondary shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Language Selector - Desktop Only */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notification Button - Desktop Only */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={`hidden sm:flex transition-colors h-9 w-9 relative ${
                !hasAccess
                  ? 'text-gray-300 cursor-not-allowed hover:text-gray-300 hover:bg-transparent'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => {
                if (hasAccess) {
                  setNotificationsOpen(true);
                }
              }}
              disabled={!hasAccess}
              title={
                hasAccess 
                  ? 'Notification Assortis'
                  : (t('permissions.feature.notificationsRestricted') || 'Notifications are reserved for registered members')
              }
              aria-label={
                hasAccess 
                  ? 'Notification Assortis'
                  : (t('permissions.feature.notificationsRestricted') || 'Notifications are reserved for registered members')
              }
            >
              <Bell className="h-5 w-5" strokeWidth={2} />
              {hasAccess && kpis.unread > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-semibold"
                >
                  {kpis.unread > 99 ? '99+' : kpis.unread}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors h-9 w-9 relative"
              onClick={() => setCartOpen(true)}
              aria-label={t('training.cart.open')}
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2} />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-semibold"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Button>

            {/* User Menu - Desktop */}
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative hidden sm:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-full h-9 w-9 relative"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label={t('userMenu.myAccount')}
                  aria-expanded={userMenuOpen}
                >
                  <User className="h-5 w-5" strokeWidth={2} />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                </Button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-md border border-gray-200 shadow-lg z-50 py-1">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {t('userMenu.myAccount')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                      >
                        <UserCircle className="h-4 w-4 text-gray-500" />
                        <span>{t('userMenu.profile')}</span>
                      </button>

                      <button
                        onClick={handleFAQClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-left"
                      >
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                        <span>{t('nav.faq')}</span>
                      </button>

                      <div className="my-1 h-px bg-gray-200" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('userMenu.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors rounded-full h-9 w-9"
                onClick={() => navigate('/login')}
                title={t('userMenu.myAccount')}
                aria-label={t('userMenu.myAccount')}
              >
                <User className="h-5 w-5" strokeWidth={2} />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={2} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            {/* Mobile Navigation Links */}
            <nav className="space-y-1 mb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                let isActive = false;
                
                if (item.path === '/calls') {
                  isActive = 
                    location.pathname === '/' || 
                    location.pathname === '/calls' || 
                    location.pathname.startsWith('/calls/') ||
                    location.pathname === '/tenders' ||
                    location.pathname.startsWith('/tenders/');
                } else if (item.path === '/services/projects') {
                  isActive = location.pathname.startsWith('/services/projects');
                } else if (item.path === '/services/organization/matching-projects') {
                  isActive = location.pathname.startsWith('/services/organization');
                } else if (item.path === '/services/experts/matching-opportunities') {
                  isActive = location.pathname.startsWith('/services/experts');
                } else if (item.path === '/services/posting-board') {
                  isActive = location.pathname.startsWith('/services/posting-board');
                } else if (item.path === '/services/training') {
                  isActive = location.pathname.startsWith('/services/training');
                } else if (item.path === '/experts/my-cv/dashboard') {
                  isActive = location.pathname.startsWith('/experts/my-cv');
                } else {
                  isActive = location.pathname.startsWith(item.path);
                }
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-accent bg-secondary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Actions */}
            <div className="border-t border-gray-200 pt-4 space-y-3 px-4">
              {/* Search */}
              <button
                onClick={() => {
                  if (hasAccess) {
                    navigate('/search');
                    setMobileMenuOpen(false);
                  }
                }}
                disabled={!hasAccess}
                className={`w-full flex items-center gap-3 py-2 text-base ${
                  !hasAccess
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="h-5 w-5" strokeWidth={2} />
                <span>{t('nav.search') || 'Search'}</span>
              </button>

              {/* Language Selector Mobile */}
              <div className="flex items-center gap-3 py-2">
                <LanguageSelector />
              </div>

              {/* Notifications */}
              <button
                onClick={() => {
                  if (hasAccess) {
                    setNotificationsOpen(true);
                    setMobileMenuOpen(false);
                  }
                }}
                disabled={!hasAccess}
                className={`w-full flex items-center gap-3 py-2 text-base relative ${
                  !hasAccess
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="h-5 w-5" strokeWidth={2} />
                <span>Notifications</span>
                {hasAccess && kpis.unread > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-semibold"
                  >
                    {kpis.unread > 99 ? '99+' : kpis.unread}
                  </Badge>
                )}
              </button>

              <button
                onClick={() => {
                  setCartOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 py-2 text-base text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                <span>{t('training.cart.open')}</span>
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-semibold"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </button>

              {/* User Profile / Login */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        {t('userMenu.myAccount')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleProfileClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 py-2 text-base text-gray-600 hover:text-gray-900"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span>{t('userMenu.profile')}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleFAQClick();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 py-2 text-base text-gray-600 hover:text-gray-900"
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span>{t('nav.faq')}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 py-2 text-base text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('userMenu.logout')}</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 py-2 text-base text-gray-600 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  <span>{t('userMenu.myAccount')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Notification Panel */}
      <NotificationPanel 
        open={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="border-b">
            <SheetTitle>{t('training.cart.title')}</SheetTitle>
            <SheetDescription>{t('training.cart.subtitle')}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-auto px-4 py-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t('training.cart.empty')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.courseId} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-primary text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.duration}h</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.courseId)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        {t('training.cart.remove')}
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-primary mt-2">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SheetFooter className="border-t bg-white">
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{t('training.cart.total')}</span>
                <span className="text-xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                disabled={cartItems.length === 0}
                onClick={() => {
                  setCartOpen(false);
                  navigate('/training/checkout');
                }}
              >
                {t('training.cart.checkout')}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </header>
  );
}