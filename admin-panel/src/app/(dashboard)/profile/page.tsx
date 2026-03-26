'use client';

import { useState } from 'react';
import { Camera, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast(t('profile.nameRequired'), 'error');
      return;
    }
    addToast(t('profile.updateSuccess'), 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.oldPassword) {
      addToast(t('profile.oldPasswordRequired'), 'error');
      return;
    }

    if (!passwordData.newPassword) {
      addToast(t('profile.newPasswordRequired'), 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast(t('profile.passwordMinLength'), 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast(t('profile.passwordMismatch'), 'error');
      return;
    }

    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    addToast(t('profile.passwordChangeSuccess'), 'success');
  };

  const handleLogoutAll = () => {
    addToast(t('profile.logoutAllSuccess'), 'info');
  };

  const roleDisplay: Record<string, string> = {
    super_admin: 'Baş Administrator',
    admin: 'Administrator',
    manager: 'Menecir',
    agent: 'Agent',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('profile.title')}
        </h1>
      </div>

      {/* Main Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar Section */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4"
                  style={{ backgroundColor: '#6C63FF' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>

                {/* User Name */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {user?.name}
                </h2>

                {/* Role Badge */}
                <Badge
                  variant="secondary"
                  className="mb-4"
                  style={{
                    backgroundColor: '#6C63FF',
                    color: 'white',
                    borderColor: '#6C63FF',
                  }}
                >
                  {roleDisplay[user?.role as string] || user?.role}
                </Badge>

                {/* Change Avatar Button */}
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 mt-4"
                >
                  <Camera size={16} />
                  {t('profile.changeAvatar')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.personalInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Name Input */}
                <div>
                  <Input
                    label={t('common.name')}
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder={t('profile.namePlaceholder') || 'Ad və Soyadı daxil edin'}
                  />
                </div>

                {/* Email Input (Disabled) */}
                <div>
                  <Input
                    label={t('common.email')}
                    name="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-100 dark:bg-slate-700 cursor-not-allowed"
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <Input
                    label={t('common.phone')}
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+994 ХХ XXX XX XX"
                  />
                </div>

                {/* Role Select (Disabled) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('users.role')}
                  </label>
                  <select
                    value={user?.role || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white cursor-not-allowed disabled:opacity-50"
                  >
                    <option>{roleDisplay[user?.role as string] || user?.role}</option>
                  </select>
                </div>

                {/* Save Button */}
                <Button
                  type="submit"
                  className="w-full"
                  style={{ backgroundColor: '#6C63FF' }}
                >
                  {t('common.update')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.changePassword')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Old Password */}
              <Input
                label={t('profile.oldPassword')}
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                placeholder={t('profile.oldPasswordPlaceholder') || 'Köhnə şifrəni daxil edin'}
              />

              {/* New Password */}
              <Input
                label={t('profile.newPassword')}
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder={t('profile.newPasswordPlaceholder') || 'Yeni şifrəni daxil edin'}
              />

              {/* Confirm Password */}
              <Input
                label={t('profile.confirmPassword')}
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder={t('profile.confirmPasswordPlaceholder') || 'Şifrəni təkrarlayın'}
              />
            </div>

            {/* Change Password Button */}
            <Button
              type="submit"
              style={{ backgroundColor: '#6C63FF' }}
            >
              {t('profile.changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.sessions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{t('profile.lastLoginDate')}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                17 Mart 2026, 14:32
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{t('profile.ipAddress')}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                192.168.1.105
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">{t('profile.deviceInfo')}:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                Chrome / macOS
              </span>
            </div>

            {/* Logout All Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
              <Button
                variant="outline"
                className="w-full text-red-600 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleLogoutAll}
              >
                <LogOut size={16} className="mr-2" />
                {t('profile.logoutAll')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
