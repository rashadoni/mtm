'use client';

import { useState } from 'react';
import {
  Trophy, Medal, Star, Flame, Target, Zap, Camera,
  MapPin, Clock, TrendingUp, Crown, Award, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

// ===== Types =====
interface AgentScore {
  id: string;
  name: string;
  avatar: string;
  score: number;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  visits: number;
  tasks: number;
  photos: number;
  onTime: number;
  badges: string[];
  trend: 'up' | 'down' | 'same';
  rankChange: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlockedBy: string[];
  total: number;
}

// ===== Mock Data =====
const agents: AgentScore[] = [
  {
    id: '1', name: 'Leyla Qasımova', avatar: 'LQ', score: 9650, level: 12, xp: 650, xpToNext: 1000,
    streak: 18, visits: 98, tasks: 52, photos: 145, onTime: 96, badges: ['speed', 'photo', 'streak', 'perfect'],
    trend: 'up', rankChange: 0,
  },
  {
    id: '2', name: 'Əhməd Məmmədov', avatar: 'ƏM', score: 9200, level: 11, xp: 800, xpToNext: 1000,
    streak: 14, visits: 92, tasks: 48, photos: 130, onTime: 94, badges: ['speed', 'customer', 'streak'],
    trend: 'up', rankChange: 1,
  },
  {
    id: '3', name: 'Sərxan Yusifov', avatar: 'SY', score: 8800, level: 10, xp: 300, xpToNext: 1000,
    streak: 12, visits: 87, tasks: 45, photos: 120, onTime: 90, badges: ['speed', 'photo'],
    trend: 'down', rankChange: -1,
  },
  {
    id: '4', name: 'Günel Əhmədova', avatar: 'GƏ', score: 8400, level: 10, xp: 100, xpToNext: 1000,
    streak: 10, visits: 82, tasks: 42, photos: 110, onTime: 87, badges: ['customer', 'streak'],
    trend: 'up', rankChange: 2,
  },
  {
    id: '5', name: 'Farid Hüseynov', avatar: 'FH', score: 8100, level: 9, xp: 700, xpToNext: 1000,
    streak: 8, visits: 78, tasks: 40, photos: 105, onTime: 85, badges: ['speed'],
    trend: 'same', rankChange: 0,
  },
  {
    id: '6', name: 'Kamran İsmayılov', avatar: 'Kİ', score: 7600, level: 9, xp: 200, xpToNext: 1000,
    streak: 6, visits: 72, tasks: 37, photos: 95, onTime: 82, badges: ['photo'],
    trend: 'down', rankChange: -2,
  },
  {
    id: '7', name: 'Rəfail Əliəv', avatar: 'RƏ', score: 7200, level: 8, xp: 500, xpToNext: 1000,
    streak: 4, visits: 65, tasks: 32, photos: 85, onTime: 78, badges: [],
    trend: 'up', rankChange: 1,
  },
  {
    id: '8', name: 'Nigar Hüseynova', avatar: 'NH', score: 6800, level: 8, xp: 100, xpToNext: 1000,
    streak: 3, visits: 58, tasks: 28, photos: 72, onTime: 72, badges: ['customer'],
    trend: 'down', rankChange: -1,
  },
];

const achievements: Achievement[] = [
  {
    id: 'speed', name: 'Sürət Ustası', description: 'Bütün marşrutları vaxtında tamamla',
    icon: <Zap size={20} />, color: '#FFC107', unlockedBy: ['1', '2', '3', '5'], total: 8,
  },
  {
    id: 'photo', name: 'Foto Çempionu', description: '100+ keyfiyyətli foto yüklə',
    icon: <Camera size={20} />, color: '#6C63FF', unlockedBy: ['1', '3', '6'], total: 8,
  },
  {
    id: 'streak', name: 'Ardıcıl Uğur', description: '10+ gün ardıcıl tam hesabat',
    icon: <Flame size={20} />, color: '#E74C3C', unlockedBy: ['1', '2', '4'], total: 8,
  },
  {
    id: 'customer', name: 'Müştəri Dostu', description: 'Müştəri məmnuniyyəti 95%+',
    icon: <Star size={20} />, color: '#00BFA6', unlockedBy: ['2', '4', '8'], total: 8,
  },
  {
    id: 'perfect', name: 'Mükəmməl Həftə', description: 'Həftə ərzində 0 gecikm',
    icon: <Crown size={20} />, color: '#9B59B6', unlockedBy: ['1'], total: 8,
  },
];

const weeklyScores = [
  { day: 'Baz.e', Leyla: 180, Əhməd: 160, Sərxan: 140 },
  { day: 'Ç.axş', Leyla: 195, Əhməd: 175, Sərxan: 155 },
  { day: 'Çər', Leyla: 210, Əhməd: 190, Sərxan: 170 },
  { day: 'C.axş', Leyla: 185, Əhməd: 200, Sərxan: 160 },
  { day: 'Cümə', Leyla: 220, Əhməd: 185, Sərxan: 175 },
  { day: 'Şən', Leyla: 200, Əhməd: 170, Sərxan: 165 },
  { day: 'Bazar', Leyla: 160, Əhməd: 145, Sərxan: 130 },
];

// ===== Components =====
const podiumColors = ['#FFC107', '#C0C0C0', '#CD7F32'];
const podiumIcons = [
  <Crown key="1" size={24} className="text-yellow-500" />,
  <Medal key="2" size={24} className="text-gray-400" />,
  <Medal key="3" size={24} className="text-amber-700" />,
];

function XPBar({ xp, xpToNext, level }: { xp: number; xpToNext: number; level: number }) {
  const pct = (xp / xpToNext) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-bold" style={{ color: '#6C63FF' }}>
        {level}
      </div>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#6C63FF' }} />
      </div>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 w-14 text-right">{xp}/{xpToNext}</span>
    </div>
  );
}

function BadgeIcon({ badge }: { badge: string }) {
  const config: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    speed: { icon: <Zap size={10} />, color: '#FFC107', label: 'Sürət' },
    photo: { icon: <Camera size={10} />, color: '#6C63FF', label: 'Foto' },
    streak: { icon: <Flame size={10} />, color: '#E74C3C', label: 'Ardıcıl' },
    customer: { icon: <Star size={10} />, color: '#00BFA6', label: 'Müştəri' },
    perfect: { icon: <Crown size={10} />, color: '#9B59B6', label: 'Mükəmməl' },
  };
  const c = config[badge];
  if (!c) return null;
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
      style={{ backgroundColor: c.color }}
      title={c.label}
    >
      {c.icon}
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('monthly');
  const { t } = useTranslation();
  const top3 = agents.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Trophy size={32} style={{ color: '#FFC107' }} />
            {t('leaderboard.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('leaderboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {([
            { key: 'weekly' as const, label: t('leaderboard.weekly') },
            { key: 'monthly' as const, label: t('leaderboard.monthly') },
            { key: 'alltime' as const, label: t('leaderboard.allTime') },
          ]).map((p) => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p.key)}
              style={period === p.key ? { backgroundColor: '#FFC107', color: '#000' } : undefined}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Podium - Top 3 */}
      <Card className="overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <CardContent className="pt-8 pb-8">
          <div className="flex items-end justify-center gap-4 sm:gap-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold border-4"
                style={{ borderColor: podiumColors[1], backgroundColor: '#2d2d44' }}
              >
                {top3[1]?.avatar}
              </div>
              <p className="text-white text-sm font-medium mt-2">{top3[1]?.name.split(' ')[0]}</p>
              <p className="text-gray-400 text-xs">{top3[1]?.score.toLocaleString()} {t('leaderboard.points')}</p>
              <div className="mt-2 w-20 sm:w-28 h-20 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#C0C0C0' }}>
                <span className="text-3xl font-bold text-white">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4">
              <Crown size={28} className="text-yellow-400 mb-1" />
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-4 ring-4 ring-yellow-400/30"
                style={{ borderColor: podiumColors[0], backgroundColor: '#2d2d44' }}
              >
                {top3[0]?.avatar}
              </div>
              <p className="text-white text-sm font-semibold mt-2">{top3[0]?.name.split(' ')[0]}</p>
              <p className="text-yellow-400 text-xs font-medium">{top3[0]?.score.toLocaleString()} {t('leaderboard.points')}</p>
              <div className="mt-2 w-24 sm:w-32 h-28 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#FFC107' }}>
                <span className="text-4xl font-bold text-white">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold border-4"
                style={{ borderColor: podiumColors[2], backgroundColor: '#2d2d44' }}
              >
                {top3[2]?.avatar}
              </div>
              <p className="text-white text-sm font-medium mt-2">{top3[2]?.name.split(' ')[0]}</p>
              <p className="text-gray-400 text-xs">{top3[2]?.score.toLocaleString()} {t('leaderboard.points')}</p>
              <div className="mt-2 w-20 sm:w-28 h-16 rounded-t-lg flex items-center justify-center" style={{ backgroundColor: '#CD7F32' }}>
                <span className="text-3xl font-bold text-white">3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Full Ranking Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award size={18} style={{ color: '#FFC107' }} />
                {t('leaderboard.fullRanking')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents.map((agent, i) => (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                      i < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent dark:from-yellow-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {i < 3 ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: podiumColors[i] }}
                        >
                          {i + 1}
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-500">{i + 1}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: '#6C63FF' }}
                    >
                      {agent.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{agent.name}</p>
                        {agent.trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                        {agent.trend === 'down' && <TrendingUp size={12} className="text-red-500 rotate-180" />}
                        {agent.rankChange !== 0 && (
                          <span className={`text-[10px] font-medium ${agent.rankChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {agent.rankChange > 0 ? `+${agent.rankChange}` : agent.rankChange}
                          </span>
                        )}
                      </div>
                      <XPBar xp={agent.xp} xpToNext={agent.xpToNext} level={agent.level} />
                    </div>

                    {/* Badges */}
                    <div className="flex gap-1 flex-shrink-0">
                      {agent.badges.map((b) => <BadgeIcon key={b} badge={b} />)}
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Flame size={14} className="text-orange-500" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{agent.streak}</span>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0 w-16">
                      <p className="text-sm font-bold" style={{ color: '#6C63FF' }}>{agent.score.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">{t('leaderboard.points')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} style={{ color: '#6C63FF' }} />
                {t('leaderboard.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: ach.color }}
                  >
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ach.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{ach.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(ach.unlockedBy.length / ach.total) * 100}%`, backgroundColor: ach.color }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">{ach.unlockedBy.length}/{ach.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('leaderboard.weeklyScore')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyScores} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="Leyla" fill="#FFC107" name="Leyla" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Əhməd" fill="#6C63FF" name="Əhməd" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Sərxan" fill="#00BFA6" name="Sərxan" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Scoring Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('leaderboard.pointSystem')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {[
                  { icon: <MapPin size={12} />, label: t('leaderboard.completeVisit'), points: '+50' },
                  { icon: <Target size={12} />, label: t('leaderboard.completeTask'), points: '+30' },
                  { icon: <Camera size={12} />, label: t('leaderboard.uploadPhoto'), points: '+10' },
                  { icon: <Clock size={12} />, label: t('leaderboard.onTimeArrival'), points: '+20' },
                  { icon: <Flame size={12} />, label: t('leaderboard.streakBonus'), points: '×1.5' },
                  { icon: <Star size={12} />, label: t('leaderboard.customerRating'), points: '+100' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400">{rule.icon}</span>
                      {rule.label}
                    </div>
                    <span className="font-bold" style={{ color: '#6C63FF' }}>{rule.points}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
