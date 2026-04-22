import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@app/types/notification.dto';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  FileUser,
  Users,
  LayoutDashboard,
  Database,
  UserCircle,
  Zap,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Sparkles,
  FileText,
  UserCheck,
  Mail,
  Send,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';

export default function ExpertsCVProfiles() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis, cvProfiles } = useExperts();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // Bulk Upload states
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [bulkUploadFiles, setBulkUploadFiles] = useState<File[]>([]);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [bulkUploadStatus, setBulkUploadStatus] = useState('');

  // Match with ToR states
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState<any>(null);
  const [selectedToR, setSelectedToR] = useState('');
  const [matchingInProgress, setMatchingInProgress] = useState(false);

  const { addNotification } = useNotifications();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleBulkFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setBulkUploadFiles(Array.from(files));
    }
  };

  const handleUpload = () => {
    if (uploadFile) {
      setUploadStatus('Uploading...');
      setUploadProgress(0);

      // Simulate file upload
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress < 100) {
            return prevProgress + 10;
          } else {
            clearInterval(interval);
            setUploadStatus('Completed');
            toast.success(t('experts.cv.uploadSuccess'));
            setIsUploadDialogOpen(false);
            setUploadFile(null);
            setUploadProgress(0);
            setUploadStatus('');
            return 100;
          }
        });
      }, 500);
    }
  };

  const handleBulkUpload = () => {
    if (bulkUploadFiles.length > 0) {
      setBulkUploadStatus('Uploading...');
      setBulkUploadProgress(0);

      // Simulate bulk file upload
      const interval = setInterval(() => {
        setBulkUploadProgress((prevProgress) => {
          if (prevProgress < 100) {
            return prevProgress + 5;
          } else {
            clearInterval(interval);
            setBulkUploadStatus('Completed');
            toast.success(t('experts.cv.bulkUploadSuccess', { count: bulkUploadFiles.length }));
            addNotification({
              type: NotificationTypeEnum.SUCCESS,
              priority: NotificationPriorityEnum.MEDIUM,
              message: t('experts.cv.bulkUploadSuccess', { count: bulkUploadFiles.length }),
            });
            setIsBulkUploadDialogOpen(false);
            setBulkUploadFiles([]);
            setBulkUploadProgress(0);
            setBulkUploadStatus('');
            return 100;
          }
        });
      }, 500);
    }
  };

  const handleViewProfile = (cv: any) => {
    // Navigate to expert public profile based on CV data
    if (cv.extractedData?.expertId) {
      navigate(`/experts/profile/${cv.extractedData.expertId}`);
    } else {
      toast.info(t('experts.cv.profileNotLinked'));
    }
  };

  const handleMatchWithToR = (cv: any) => {
    setSelectedCV(cv);
    setSelectedToR('');
    setIsMatchDialogOpen(true);
  };

  const handleStartMatching = () => {
    if (!selectedToR.trim()) {
      toast.error(t('experts.cv.matching.error'));
      return;
    }

    setMatchingInProgress(true);
    
    // Simulate AI matching process
    setTimeout(() => {
      setMatchingInProgress(false);
      setIsMatchDialogOpen(false);
      toast.success(t('experts.cv.matching.success', { cvName: selectedCV?.extractedData?.name || 'Expert' }));
      addNotification({
        type: NotificationTypeEnum.INFORMATION,
        priority: NotificationPriorityEnum.MEDIUM,
        message: t('experts.cv.matching.success', { cvName: selectedCV?.extractedData?.name || 'Expert' }),
      });
      setSelectedCV(null);
      setSelectedToR('');
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('experts.cv.title')}
        description={t('experts.cv.subtitle')}
        icon={FileUser}
        stats={[
          { value: kpis.cvProcessed.toString(), label: t('experts.card.cvProfiles.stats.processed') },
          { value: '94%', label: t('experts.card.cvProfiles.stats.successRate') },
          { value: kpis.verifiedProfiles.toString(), label: t('experts.stats.verified') }
        ]}
      />

      {/* Sub Menu */}
      <SubMenu
        items={[
          { label: t('experts.submenu.database'), icon: Database, onClick: () => navigate('/experts/database') },
          { label: t('experts.submenu.cvProfiles'), active: true, icon: FileUser, onClick: () => navigate('/experts/cv-profiles') },
          { label: t('experts.submenu.profiles'), icon: UserCircle, onClick: () => navigate('/experts/profiles') },
          { label: t('experts.submenu.matching'), icon: Zap, onClick: () => navigate('/experts/matching') },
          { label: t('experts.submenu.cvTemplates'), icon: FileText, onClick: () => navigate('/experts/cv-templates') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {t('experts.cv.aiPowered.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('experts.cv.aiPowered.description')}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      {t('experts.cv.upload')}
                    </Button>
                    <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(true)}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('experts.cv.bulkUpload')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +12%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">1,456</h3>
              <p className="text-sm text-muted-foreground">{t('experts.card.cvProfiles.stats.processed')}</p>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Active
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">23</h3>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>

            <div className="bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  94%
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-1">1,369</h3>
              <p className="text-sm text-muted-foreground">{t('experts.card.cvProfiles.stats.successRate')}</p>
            </div>
          </div>

          {/* CV Profiles List */}
          <div className="bg-white rounded-lg border p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-primary">Recent CV Uploads</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {cvProfiles.map((cv) => (
                <div
                  key={cv.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-1">
                          {cv.fileName}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {t('experts.cv.uploadedOn')}: {new Date(cv.uploadedDate).toLocaleDateString()}
                        </p>
                        
                        {cv.status === 'PROCESSING' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">Processing...</span>
                              <span className="text-xs text-muted-foreground">68%</span>
                            </div>
                            <Progress value={68} className="h-1" />
                          </div>
                        )}

                        {cv.status === 'COMPLETED' && cv.extractedData && (
                          <div className="mt-3 space-y-2">
                            {cv.extractedData.name && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Name: </span>
                                <span className="text-primary font-medium">{cv.extractedData.name}</span>
                              </div>
                            )}
                            {cv.extractedData.email && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Email: </span>
                                <span className="text-primary">{cv.extractedData.email}</span>
                              </div>
                            )}
                            {cv.extractedData.skills && cv.extractedData.skills.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                {cv.extractedData.skills.slice(0, 5).map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                                {cv.extractedData.skills.length > 5 && (
                                  <Badge variant="outline">
                                    +{cv.extractedData.skills.length - 5}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className={getStatusColor(cv.status)}>
                        {getStatusIcon(cv.status)}
                        <span className="ml-1">{t(`experts.cv.status.${cv.status}`)}</span>
                      </Badge>
                      
                      {cv.matchingScore && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-semibold text-primary">
                            {cv.matchingScore}% {t('experts.cv.matchScore')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {cv.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button variant="default" size="sm" onClick={() => handleViewProfile(cv)}>
                        {t('experts.cv.viewProfile')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3 mr-1" />
                        {t('experts.cv.download')}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleMatchWithToR(cv)}>
                        {t('experts.cv.matchWithToR')}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload CV</DialogTitle>
            <DialogDescription>
              Upload a CV file to process with our AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            {uploadFile && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-primary">{uploadFile.name}</span>
              </div>
            )}
            {uploadStatus && (
              <div className="flex items-center gap-2">
                {uploadStatus === 'Uploading...' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm text-primary">{uploadStatus}</span>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-1" />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || uploadStatus === 'Uploading...'}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Upload CVs</DialogTitle>
            <DialogDescription>
              Upload multiple CV files to process with our AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={handleBulkFilesChange}
              className="file-input"
            />
            {bulkUploadFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-primary">
                  {bulkUploadFiles.length} files selected
                </span>
              </div>
            )}
            {bulkUploadStatus && (
              <div className="flex items-center gap-2">
                {bulkUploadStatus === 'Uploading...' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm text-primary">{bulkUploadStatus}</span>
              </div>
            )}
            {bulkUploadProgress > 0 && bulkUploadProgress < 100 && (
              <Progress value={bulkUploadProgress} className="h-1" />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={bulkUploadFiles.length === 0 || bulkUploadStatus === 'Uploading...'}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Match with ToR Dialog */}
      <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Match CV with ToR</DialogTitle>
            <DialogDescription>
              Enter the ToR details to match the selected CV.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter ToR details here..."
              value={selectedToR}
              onChange={(e) => setSelectedToR(e.target.value)}
              className="textarea"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMatchDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartMatching}
              disabled={matchingInProgress}
            >
              {matchingInProgress ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                'Match'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}