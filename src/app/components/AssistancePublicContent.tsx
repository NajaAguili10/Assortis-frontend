import React from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import {
  FileText,
  Search,
  Clock,
  CheckCircle,
  Lock,
  ArrowRight,
} from 'lucide-react';

export function AssistancePublicContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      key: 'request',
      icon: FileText,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      available: true,
      onClick: () => navigate('/assistance/request'),
    },
    {
      key: 'findExpert',
      icon: Search,
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      available: false,
      onClick: undefined,
    },
    {
      key: 'history',
      icon: Clock,
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      available: false,
      onClick: undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Introduction Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-primary mb-2">
              {t('assistance.public.introduction.title')}
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t('assistance.public.introduction.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4">
          {t('assistance.public.services.title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            const isAvailable = service.available;

            return (
              <div
                key={service.key}
                className={`border ${service.borderColor} rounded-lg p-5 ${
                  isAvailable ? 'bg-white hover:shadow-md transition-shadow' : service.bgColor
                } ${!isAvailable ? 'opacity-75' : ''}`}
              >
                {/* Header with Icon and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${service.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${service.iconColor}`} />
                  </div>
                  <div className="flex-shrink-0">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {t(`assistance.public.submenu.${service.key}.status`)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                        <Lock className="w-3 h-3" />
                        {t(`assistance.public.submenu.${service.key}.status`)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-primary mb-2">
                  {t(`assistance.public.submenu.${service.key}.title`)}
                </h4>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4 min-h-[80px]">
                  {t(`assistance.public.submenu.${service.key}.description`)}
                </p>

                {/* Benefit or Action */}
                {isAvailable ? (
                  <Button
                    onClick={service.onClick}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    size="sm"
                  >
                    {t(`assistance.public.submenu.${service.key}.action`)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-900 leading-relaxed">
                      {t(`assistance.public.submenu.${service.key}.benefit`)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-primary mb-2">
              {t('assistance.public.cta.title')}
            </h3>
            <p className="text-sm text-gray-700">
              {t('assistance.public.cta.description')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              onClick={() => navigate('/signup')}
              className="bg-primary hover:bg-primary/90 text-white px-6"
              size="lg"
            >
              {t('assistance.public.cta.button')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
