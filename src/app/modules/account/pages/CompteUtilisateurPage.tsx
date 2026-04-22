import { useState, useRef } from 'react';
import { useTranslation } from '../../../contexts/LanguageContext';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { AccountSubMenu } from '../../../components/AccountSubMenu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { BookOpen, User, Video } from 'lucide-react';
import { toast } from 'sonner';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface CompteUtilisateurPageProps {
  initialTab?: 'profile' | 'security' | 'resources';
}

const CompteUtilisateurPage = ({ initialTab = 'profile' }: CompteUtilisateurPageProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial user data for reset
  const initialUserData = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    position: 'Project Manager',
    organization: 'International Organization',
    bio: '',
    location: 'Paris, France',
    website: '',
    linkedin: '',
  };

  // Mock user data
  const [userData, setUserData] = useState(initialUserData);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  // Password data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phone === '' || phoneRegex.test(phone);
  };

  const validateURL = (url: string): boolean => {
    if (url === '') return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate required fields
    if (!userData.firstName.trim()) {
      newErrors.firstName = t('account.validation.required');
    }
    if (!userData.lastName.trim()) {
      newErrors.lastName = t('account.validation.required');
    }
    if (!userData.email.trim()) {
      newErrors.email = t('account.validation.required');
    } else if (!validateEmail(userData.email)) {
      newErrors.email = t('account.validation.email.invalid');
    }

    // Validate optional fields
    if (userData.phone && !validatePhone(userData.phone)) {
      newErrors.phone = t('account.validation.phone.invalid');
    }
    if (userData.website && !validateURL(userData.website)) {
      newErrors.website = t('account.validation.url.invalid');
    }
    if (userData.linkedin && !validateURL(userData.linkedin)) {
      newErrors.linkedin = t('account.validation.url.invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      // Save logic here - In production, this would call an API
      console.log('Saving user data:', userData);
      toast.success(t('account.actions.saved'));
      // Reset initial data to current values after successful save
      Object.assign(initialUserData, userData);
    } else {
      // Show error message
      toast.error(t('account.validation.invalidFields'));
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const handleCancel = () => {
    setUserData(initialUserData);
    setErrors({});
    toast.info(t('account.validation.changesDiscarded'));
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Photo upload handler
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        toast.success(t('account.validation.photoUploaded'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoRemove = () => {
    setProfilePhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success(t('account.validation.photoRemoved'));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Password validation and handlers
  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    // Validate all fields are required
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = t('account.validation.required');
    }
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = t('account.validation.required');
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t('account.validation.password.minLength');
    }
    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('account.validation.required');
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = t('account.validation.password.noMatch');
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = () => {
    if (validatePasswordForm()) {
      // In production, this would call an API to change the password
      console.log('Changing password...');
      toast.success(t('account.validation.password.changed'));
      
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } else {
      // Show error message
      toast.error(t('account.validation.password.invalidFields'));
      
      // Scroll to first error
      const firstErrorField = Object.keys(passwordErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (passwordErrors[field as keyof PasswordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Banner */}
      <PageBanner
        icon={User}
        title={t('account.banner.title')}
        description={t('account.banner.description')}
      />

      {/* SubMenu */}
      <AccountSubMenu activeTab={activeTab} onTabChange={setActiveTab} mode="profile-settings" />

      {/* Page Content */}
      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('account.profile.title')}</CardTitle>
                <CardDescription>{t('account.profile.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                {/* Profile Photo */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    {profilePhoto ? (
                      <AvatarImage src={profilePhoto} alt={`${userData.firstName} ${userData.lastName}`} />
                    ) : (
                      <AvatarFallback className="text-2xl" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                        {userData.firstName[0]}{userData.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-2">
                    <Label>{t('account.profile.photo')}</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={triggerFileInput}
                      >
                        {t('account.profile.changePhoto')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePhotoRemove}
                        disabled={!profilePhoto}
                      >
                        {t('account.profile.removePhoto')}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('account.profile.firstName')} *</Label>
                    <Input
                      id="firstName"
                      value={userData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('account.profile.lastName')} *</Label>
                    <Input
                      id="lastName"
                      value={userData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('account.profile.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('account.profile.phone')}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Professional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">{t('account.profile.position')}</Label>
                    <Input
                      id="position"
                      value={userData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">{t('account.profile.organization')}</Label>
                    <Input
                      id="organization"
                      value={userData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">{t('account.profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={userData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('account.profile.location')}</Label>
                    <Input
                      id="location"
                      value={userData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">{t('account.profile.website')}</Label>
                    <Input
                      id="website"
                      type="url"
                      value={userData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://"
                      className={errors.website ? 'border-red-500' : ''}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500">{errors.website}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">{t('account.profile.linkedin')}</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={userData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className={errors.linkedin ? 'border-red-500' : ''}
                  />
                  {errors.linkedin && (
                    <p className="text-sm text-red-500">{errors.linkedin}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    {t('account.actions.save')}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    {t('account.actions.cancel')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('account.security.title')}</CardTitle>
                <CardDescription>{t('account.security.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('account.security.currentPassword')} *</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                      className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('account.security.newPassword')} *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className={passwordErrors.newPassword ? 'border-red-500' : ''}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('account.security.confirmPassword')} *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                  <Button onClick={handlePasswordChange} style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                    {t('account.security.changePassword')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'resources' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('account.resources.title')}</CardTitle>
                <CardDescription>{t('account.resources.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 bg-white">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                      <Video className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">{t('account.resources.videos')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('account.resources.videosDesc')}</p>
                    <Button variant="outline" size="sm">{t('actions.viewDetails')}</Button>
                  </div>

                  <div className="rounded-lg border p-4 bg-white">
                    <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">{t('account.resources.guides')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('account.resources.guidesDesc')}</p>
                    <Button variant="outline" size="sm">{t('actions.viewDetails')}</Button>
                  </div>

                  <div className="rounded-lg border p-4 bg-white">
                    <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center mb-3">
                      <Video className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">{t('account.resources.webinars')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('account.resources.webinarsDesc')}</p>
                    <Button variant="outline" size="sm">{t('actions.viewDetails')}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageContainer>
    </div>
  );
};

export default CompteUtilisateurPage;