import { Link } from 'react-router';
import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin,
  Send,
  Check,
  Loader2
} from 'lucide-react';
import logoImage from '../../assets/6cb2c08144ed99fcebd9949f360b4ab7cff267f4.png';

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const servicesLinks = [
    { label: t('footer.faq'), path: '/faq' },
    { label: t('footer.contact'), path: '/contact' },
    { label: t('footer.subscription'), path: '/offers' },
    { label: t('footer.about'), path: '/about' },
  ];

  const handleSubscribe = async () => {
    // Validation de l'email
    if (!email.trim()) {
      toast.error(t('footer.newsletter.errorEmpty'));
      return;
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('footer.newsletter.errorInvalid'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler une requête d'abonnement (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubscribed(true);
      setEmail('');
      toast.success(t('footer.newsletter.success'));
      
      // Reset l'état après 3 secondes pour permettre une nouvelle inscription
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    } catch (error) {
      toast.error(t('footer.newsletter.error'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  return (
    <footer className="bg-primary text-gray-300 mt-20">
      {/* Main Footer */}
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src={logoImage} 
                alt="Assortis" 
                className="h-10 brightness-0 invert" 
              />
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://www.facebook.com/assortiscooperation" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-accent rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://x.com/Assortis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-accent rounded-lg transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/assortis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-accent rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.services')}
            </h3>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t('footer.newsletter.title')}
              </h3>
              <p className="text-sm text-gray-400">
                {t('footer.newsletter.description')}
              </p>
            </div>
            <div>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder={t('footer.newsletter.placeholder')}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  className="bg-accent hover:bg-accent/90 gap-2 whitespace-nowrap"
                  onClick={handleSubscribe}
                  disabled={isSubmitting || isSubscribed}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isSubscribed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {t('footer.newsletter.subscribe')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">
                  {t('footer.email')}
                </h4>
                <a 
                  href="mailto:contact@assortis.com" 
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  contact@assortis.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">
                  {t('footer.phone')}
                </h4>
                <a 
                  href="tel:+33123456789" 
                  className="text-sm text-gray-400 hover:text-accent transition-colors"
                >
                  +33 1 23 45 67 89
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm mb-1">
                  {t('footer.address')}
                </h4>
                <p className="text-sm text-gray-400">
                  Paris, France
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <p className="text-sm text-gray-500 text-center">
            © 2026 Assortis. {t('footer.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}