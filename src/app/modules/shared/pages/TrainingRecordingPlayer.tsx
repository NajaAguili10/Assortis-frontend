import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useTraining } from '@app/hooks/useTraining';
import { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  ArrowLeft,
  Play,
  CheckCircle,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CourseModule {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

export default function TrainingRecordingPlayer() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, kpis } = useTraining();

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isModulesExpanded, setIsModulesExpanded] = useState(true);

  // Get locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'fr':
        return 'fr-FR';
      case 'es':
        return 'es-ES';
      default:
        return 'en-US';
    }
  };

  // Find the session
  const session = sessions.find(s => s.id === sessionId);

  // Course modules data
  const modules: CourseModule[] = [
    { id: '1', title: t('training.recording.modules.intro'), duration: '15:30', completed: true },
    { id: '2', title: t('training.recording.modules.lifecycle'), duration: '22:45', completed: true },
    { id: '3', title: t('training.recording.modules.planning'), duration: '28:15', completed: true },
    { id: '4', title: t('training.recording.modules.timeManagement'), duration: '25:00', completed: true },
    { id: '5', title: t('training.recording.modules.costManagement'), duration: '20:30', completed: true },
    { id: '6', title: t('training.recording.modules.qualityManagement'), duration: '18:45', completed: true },
    { id: '7', title: t('training.recording.modules.hrManagement'), duration: '23:20', completed: true },
    { id: '8', title: t('training.recording.modules.communication'), duration: '26:40', completed: true },
    { id: '9', title: t('training.recording.modules.riskManagement'), duration: '24:15', completed: false },
    { id: '10', title: t('training.recording.modules.procurement'), duration: '21:30', completed: false },
    { id: '11', title: t('training.recording.modules.integration'), duration: '27:50', completed: false },
    { id: '12', title: t('training.recording.modules.closure'), duration: '19:20', completed: false },
  ];

  const completedCount = modules.filter(m => m.completed).length;
  const totalCount = modules.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  if (!session) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('training.hub.title')}
          description={t('training.hub.subtitle')}
          icon={GraduationCap}
          stats={[
            { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
          ]}
        />
        <TrainingSubMenu />
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <div className="text-center py-12 bg-white rounded-lg border">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('common.notFound')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('training.liveSessions.noResults.message')}</p>
              <Button onClick={() => navigate('/training/catalog')}>
                {t('actions.back')}
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const currentModule = modules[currentModuleIndex];

  const handleModuleClick = (index: number) => {
    setCurrentModuleIndex(index);
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.hub.title')}
        description={t('training.hub.subtitle')}
        icon={GraduationCap}
        stats={[
          { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
        ]}
      />

      {/* Sub Menu */}
      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Video Player */}
            <div className="lg:col-span-2 space-y-4">
              {/* Video Player */}
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Video Container */}
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3d4654] to-[#B82547] opacity-90" />
                  <div className="relative z-10 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/40">
                      <Play className="w-10 h-10 ml-1" />
                    </div>
                    <p className="text-lg font-semibold mb-2">{currentModule.title}</p>
                    <p className="text-sm text-white/80">{currentModule.duration}</p>
                  </div>
                </div>

                {/* Video Controls Info */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePreviousModule}
                      disabled={currentModuleIndex === 0}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      {t('training.recording.previous')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleNextModule}
                      disabled={currentModuleIndex === modules.length - 1}
                    >
                      {t('training.recording.next')}
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-white rounded-lg border p-6">
                <h1 className="text-2xl font-bold text-primary mb-2">{session.topic}</h1>
                <p className="text-base text-muted-foreground mb-4">{session.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    <span className="font-medium text-primary">{/* Nom masqué pour confidentialité */}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(session.date).toLocaleDateString(getLocale())}</span>
                  </div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-primary mb-4">{t('training.liveSessions.instructor')}</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{/* Nom masqué pour confidentialité */}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{session.instructor.title}</p>
                    <p className="text-sm text-muted-foreground">{session.instructor.bio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Course Content */}
            <div className="space-y-4">
              {/* Progress Card */}
              <div className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-primary">{t('training.recording.progress')}</h3>
                  <span className="text-sm font-semibold text-[#B82547]">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(progressPercentage)}% {t('training.recording.completed')}
                </p>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setIsModulesExpanded(!isModulesExpanded)}
                >
                  <h3 className="font-bold text-primary">{t('training.recording.courseContent')}</h3>
                  {isModulesExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {isModulesExpanded && (
                  <div className="max-h-[600px] overflow-y-auto">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                          currentModuleIndex === index
                            ? 'bg-blue-50 border-l-4 border-l-[#B82547]'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleModuleClick(index)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {module.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : currentModuleIndex === index ? (
                              <Play className="w-5 h-5 text-[#B82547]" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium mb-1 ${
                              currentModuleIndex === index ? 'text-[#B82547]' : 'text-primary'
                            }`}>
                              {module.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{module.duration}</span>
                              {module.completed && (
                                <Badge variant="secondary" className="text-xs px-2 py-0">
                                  {t('training.recording.completed')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-3">{t('actions.quick')}</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => navigate(`/training/live-session-details/${sessionId}`)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {t('training.recording.sessionDetails')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => navigate('/training/catalog')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t('training.actions.browseCatalog')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
