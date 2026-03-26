'use client';

import { useState, useEffect } from 'react';
import {
  LogIn,
  MapPin,
  Camera,
  Route,
  Flag,
  AlertTriangle,
  Settings,
  Download,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface Activity {
  id: string;
  timestamp: string;
  agentName: string;
  agentAvatar: string;
  actionDescription: string;
  actionType: 'login' | 'visit' | 'photo' | 'route' | 'task' | 'alert' | 'system';
}

const mockActivities: Activity[] = [
  {
    id: '1',
    timestamp: '2026-03-17 14:30',
    agentName: 'Əhməd Məmmədov',
    agentAvatar: 'AM',
    actionDescription: 'sistemə daxil oldu',
    actionType: 'login',
  },
  {
    id: '2',
    timestamp: '2026-03-17 14:25',
    agentName: 'Leyla Qasımova',
    agentAvatar: 'LQ',
    actionDescription: 'Neptun Mağazalar ziyarətini tamamladı',
    actionType: 'visit',
  },
  {
    id: '3',
    timestamp: '2026-03-17 14:15',
    agentName: 'Farid Hüseynov',
    agentAvatar: 'FH',
    actionDescription: '3 foto yüklədi',
    actionType: 'photo',
  },
  {
    id: '4',
    timestamp: '2026-03-17 14:00',
    agentName: 'Rəfail Əliəv',
    agentAvatar: 'RA',
    actionDescription: 'marşrutdan kənarlaşdı',
    actionType: 'alert',
  },
  {
    id: '5',
    timestamp: '2026-03-17 13:50',
    agentName: 'Sərxan Yusifov',
    agentAvatar: 'SY',
    actionDescription: 'Bakı Supermarket ziyarətini başladı',
    actionType: 'visit',
  },
  {
    id: '6',
    timestamp: '2026-03-17 13:40',
    agentName: 'Nigar Hüseyinova',
    agentAvatar: 'NH',
    actionDescription: 'marşrutunu başladı',
    actionType: 'route',
  },
  {
    id: '7',
    timestamp: '2026-03-17 13:30',
    agentName: 'Tural Əhədov',
    agentAvatar: 'TE',
    actionDescription: '2 foto yüklədi',
    actionType: 'photo',
  },
  {
    id: '8',
    timestamp: '2026-03-17 13:20',
    agentName: 'Gülnarə Kərimova',
    agentAvatar: 'GK',
    actionDescription: 'Günay Market ziyarətini tamamladı',
    actionType: 'visit',
  },
  {
    id: '9',
    timestamp: '2026-03-17 13:10',
    agentName: 'Kamran Əbilzadə',
    agentAvatar: 'KA',
    actionDescription: 'batareya aşağı xəbərdarlığı aldı',
    actionType: 'alert',
  },
  {
    id: '10',
    timestamp: '2026-03-17 13:00',
    agentName: 'Aytən Məmmədova',
    agentAvatar: 'AM',
    actionDescription: 'sistem yeniləməsi tamamlandı',
    actionType: 'system',
  },
  {
    id: '11',
    timestamp: '2026-03-17 12:30',
    agentName: 'Əhməd Məmmədov',
    agentAvatar: 'AM',
    actionDescription: '5 foto yüklədi',
    actionType: 'photo',
  },
  {
    id: '12',
    timestamp: '2026-03-17 12:15',
    agentName: 'Leyla Qasımova',
    agentAvatar: 'LQ',
    actionDescription: 'Bravo Supermarket ziyarətini başladı',
    actionType: 'visit',
  },
  {
    id: '13',
    timestamp: '2026-03-17 12:00',
    agentName: 'Farid Hüseynov',
    agentAvatar: 'FH',
    actionDescription: 'marşrutunu tamamladı',
    actionType: 'route',
  },
  {
    id: '14',
    timestamp: '2026-03-17 11:30',
    agentName: 'Rəfail Əliəv',
    agentAvatar: 'RA',
    actionDescription: 'sistemə daxil oldu',
    actionType: 'login',
  },
  {
    id: '15',
    timestamp: '2026-03-17 11:15',
    agentName: 'Sərxan Yusifov',
    agentAvatar: 'SY',
    actionDescription: 'cihaz offline rejimdə',
    actionType: 'alert',
  },
  {
    id: '16',
    timestamp: '2026-03-17 10:45',
    agentName: 'Nigar Hüseyinova',
    agentAvatar: 'NH',
    actionDescription: 'Azərsun Holdinq ziyarətini tamamladı',
    actionType: 'visit',
  },
  {
    id: '17',
    timestamp: '2026-03-17 10:30',
    agentName: 'Tural Əhədov',
    agentAvatar: 'TE',
    actionDescription: 'yeni marşrut görcüldü',
    actionType: 'route',
  },
  {
    id: '18',
    timestamp: '2026-03-17 10:15',
    agentName: 'Gülnarə Kərimova',
    agentAvatar: 'GK',
    actionDescription: 'premium hesabatlı təqdimat tamamlandı',
    actionType: 'task',
  },
  {
    id: '19',
    timestamp: '2026-03-17 10:00',
    agentName: 'Kamran Əbilzadə',
    agentAvatar: 'KA',
    actionDescription: 'sistemə daxil oldu',
    actionType: 'login',
  },
  {
    id: '20',
    timestamp: '2026-03-17 09:30',
    agentName: 'Aytən Məmmədova',
    agentAvatar: 'AM',
    actionDescription: 'Gibson Mağazası ziyarətini başladı',
    actionType: 'visit',
  },
  {
    id: '21',
    timestamp: '2026-03-16 18:45',
    agentName: 'Əhməd Məmmədov',
    agentAvatar: 'AM',
    actionDescription: 'marşrutunu tamamladı',
    actionType: 'route',
  },
  {
    id: '22',
    timestamp: '2026-03-16 18:20',
    agentName: 'Leyla Qasımova',
    agentAvatar: 'LQ',
    actionDescription: '2 foto yüklədi',
    actionType: 'photo',
  },
  {
    id: '23',
    timestamp: '2026-03-16 17:50',
    agentName: 'Farid Hüseynov',
    agentAvatar: 'FH',
    actionDescription: 'GPS siqnalı qopdu',
    actionType: 'alert',
  },
  {
    id: '24',
    timestamp: '2026-03-16 17:30',
    agentName: 'Rəfail Əliəv',
    agentAvatar: 'RA',
    actionDescription: 'sistemə daxil oldu',
    actionType: 'login',
  },
  {
    id: '25',
    timestamp: '2026-03-16 17:00',
    agentName: 'Sərxan Yusifov',
    agentAvatar: 'SY',
    actionDescription: 'yeni tapşırıq atandı',
    actionType: 'task',
  },
  {
    id: '26',
    timestamp: '2026-03-15 16:30',
    agentName: 'Nigar Hüseyinova',
    agentAvatar: 'NH',
    actionDescription: 'Premium Market ziyarətini tamamladı',
    actionType: 'visit',
  },
];

const actionTypeIcons: Record<Activity['actionType'], React.ReactNode> = {
  login: <LogIn size={20} />,
  visit: <MapPin size={20} />,
  photo: <Camera size={20} />,
  route: <Route size={20} />,
  task: <Flag size={20} />,
  alert: <AlertTriangle size={20} />,
  system: <Settings size={20} />,
};

const actionTypeColors: Record<Activity['actionType'], string> = {
  login: '#6C63FF',
  visit: '#00BFA6',
  photo: '#3498DB',
  route: '#9B59B6',
  task: '#FFC107',
  alert: '#E74C3C',
  system: '#95A5A6',
};

// Labels will be provided by i18n in component
const actionTypeKeys: Record<Activity['actionType'], string> = {
  login: 'activity.login',
  visit: 'activity.visit',
  photo: 'activity.photo',
  route: 'activity.route',
  task: 'activity.task',
  alert: 'activity.alert',
  system: 'activity.system',
};

export default function ActivityPage() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>(mockActivities);
  const [dateFrom, setDateFrom] = useState('2026-03-15');
  const [dateTo, setDateTo] = useState('2026-03-17');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedActionType, setSelectedActionType] = useState<'all' | Activity['actionType']>('all');

  useEffect(() => {
    filterActivities();
  }, [activities, dateFrom, dateTo, selectedAgent, selectedActionType]);

  const filterActivities = () => {
    let result = activities;

    // Filter by date range
    result = result.filter((activity) => {
      const date = activity.timestamp.split(' ')[0];
      return date >= dateFrom && date <= dateTo;
    });

    // Filter by agent
    if (selectedAgent !== 'all') {
      result = result.filter((activity) =>
        activity.agentName.toLowerCase().includes(selectedAgent.toLowerCase())
      );
    }

    // Filter by action type
    if (selectedActionType !== 'all') {
      result = result.filter((activity) => activity.actionType === selectedActionType);
    }

    setFilteredActivities(result);
  };

  const groupedActivities = filteredActivities.reduce((groups: Record<string, Activity[]>, activity) => {
    const date = activity.timestamp.split(' ')[0];
    let label = '';

    if (date === new Date().toISOString().split('T')[0]) {
      label = t('activity.today');
    } else if (date === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
      label = t('activity.yesterday');
    } else {
      label = new Date(date + 'T00:00:00').toLocaleDateString('az-AZ', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(activity);
    return groups;
  }, {});

  const handleExport = () => {
    const csv = [
      [t('common.date'), t('common.time'), t('activity.agent'), t('activity.title'), t('activity.actionType')],
      ...filteredActivities.map((a) => {
        const [date, time] = a.timestamp.split(' ');
        return [date, time, a.agentName, a.actionDescription, t(actionTypeKeys[a.actionType])];
      }),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fealiyyet-jurnali.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const totalActivities = activities.length;
  const loginActivities = activities.filter((a) => a.actionType === 'login').length;
  const visitActivities = activities.filter((a) => a.actionType === 'visit').length;
  const photoActivities = activities.filter((a) => a.actionType === 'photo').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('activity.title')}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <Download size={18} />
          {t('common.export')}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Settings size={24} />}
          title={t('activity.totalActivity')}
          value={totalActivities}
          color="#6C63FF"
        />
        <StatCard
          icon={<LogIn size={24} />}
          title={t('activity.logins')}
          value={loginActivities}
          color="#6C63FF"
        />
        <StatCard
          icon={<MapPin size={24} />}
          title={t('activity.visits')}
          value={visitActivities}
          color="#00BFA6"
        />
        <StatCard
          icon={<Camera size={24} />}
          title={t('activity.photoUploads')}
          value={photoActivities}
          color="#3498DB"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Date From */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('activity.startDate')}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Date To */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('activity.endDate')}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Agent Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('activity.agent')}
              </label>
              <div className="relative">
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="Əhməd Məmmədov">Əhməd Məmmədov</option>
                  <option value="Leyla Qasımova">Leyla Qasımova</option>
                  <option value="Farid Hüseynov">Farid Hüseynov</option>
                  <option value="Rəfail Əliəv">Rəfail Əliəv</option>
                  <option value="Sərxan Yusifov">Sərxan Yusifov</option>
                  <option value="Nigar Hüseyinova">Nigar Hüseyinova</option>
                  <option value="Tural Əhədov">Tural Əhədov</option>
                  <option value="Gülnarə Kərimova">Gülnarə Kərimova</option>
                  <option value="Kamran Əbilzadə">Kamran Əbilzadə</option>
                  <option value="Aytən Məmmədova">Aytən Məmmədova</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Action Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('activity.actionType')}
              </label>
              <div className="relative">
                <select
                  value={selectedActionType}
                  onChange={(e) => setSelectedActionType(e.target.value as 'all' | Activity['actionType'])}
                  className="w-full appearance-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary pr-10 transition-all"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="login">{t('activity.login')}</option>
                  <option value="visit">{t('activity.visit')}</option>
                  <option value="photo">{t('activity.photo')}</option>
                  <option value="route">{t('activity.route')}</option>
                  <option value="task">{t('activity.task')}</option>
                  <option value="alert">{t('activity.alert')}</option>
                  <option value="system">{t('activity.system')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
          <div key={dateLabel}>
            {/* Date Separator */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700"></div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-4 py-1 bg-white dark:bg-slate-900 rounded-full border border-gray-200 dark:border-gray-700">
                {dateLabel}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-l from-gray-200 to-transparent dark:from-gray-700"></div>
            </div>

            {/* Activity Items */}
            <div className="space-y-3">
              {dateActivities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: actionTypeColors[activity.actionType] + '20',
                          color: actionTypeColors[activity.actionType],
                        }}
                      >
                        {actionTypeIcons[activity.actionType]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                              style={{ backgroundColor: 'var(--primary)' }}
                            >
                              {activity.agentAvatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {activity.agentName}{' '}
                                <span className="font-normal text-gray-600 dark:text-gray-400">
                                  {activity.actionDescription}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {activity.timestamp}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className="font-semibold flex-shrink-0 ml-2"
                            style={{
                              backgroundColor: actionTypeColors[activity.actionType] + '20',
                              color: actionTypeColors[activity.actionType],
                            }}
                          >
                            {t(actionTypeKeys[activity.actionType])}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Settings size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t('activity.noResults')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
