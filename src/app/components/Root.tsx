import { Outlet } from 'react-router';
import Layout from './Layout';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { AssistanceHistoryProvider } from '../contexts/AssistanceHistoryContext';
import { OrganizationProfileProvider } from '../contexts/OrganizationProfileContext';
import { ProjectsProvider } from '../contexts/ProjectsContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { TrainingCommerceProvider } from '../contexts/TrainingCommerceContext';
import { CVCreditsProvider } from '../contexts/CVCreditsContext';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from './ui/sonner';

// Root component that provides the layout structure for all routes
export default function Root() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationsProvider>
          <CVCreditsProvider>
            <TrainingCommerceProvider>
              <OrganizationProfileProvider>
                <ProjectsProvider>
                  <AssistanceHistoryProvider>
                    <ErrorBoundary>
                      <Layout>
                        <Outlet />
                      </Layout>
                      <Toaster />
                    </ErrorBoundary>
                  </AssistanceHistoryProvider>
                </ProjectsProvider>
              </OrganizationProfileProvider>
            </TrainingCommerceProvider>
          </CVCreditsProvider>
        </NotificationsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}