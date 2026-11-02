import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, Sparkles, Bell, User as UserIcon, LogOut, RefreshCw, Shield, GraduationCap, Users } from 'lucide-react';
import { User, UserRole } from '../types';
import { isSuperAdminEmail } from '../lib/supabase';

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  currentUser: User;
  onOpenAuth: () => void;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  isSuperAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  setIsDarkMode,
  currentUser,
  onOpenAuth,
  onSwitchRole,
  onLogout,
  searchQuery = '',
  setSearchQuery,
  isSuperAdmin = false
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = isSuperAdmin || currentUser.role === 'admin' || isSuperAdminEmail(currentUser.email, currentUser.name);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return { label: 'Преподаватель', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' };
      case 'admin':
        return { label: 'Администратор', bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' };
      default:
        return { label: 'Студент', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-[#FFFFFF]/85 dark:bg-[#121418]/85 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#262A32] transition-colors duration-200">
      {/* Mobile brand (shown only on small screens) */}
      <div className="flex md:hidden items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
          </svg>
        </div>
        <span className="font-semibold text-sm text-[#111827] dark:text-[#F3F3EF]">Study OS</span>
      </div>

      {/* Search Input */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          placeholder="Поиск по темам, тестам и конспектам..."
          className="w-full pl-9 pr-12 py-2 text-xs lg:text-sm rounded-xl bg-[#F9FAFB] dark:bg-[#181B21] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] transition-all"
        />
        <kbd className="hidden sm:inline-block absolute right-3 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          ⌘K
        </kbd>
      </div>

      {/* Right controls: Theme toggle, Notifications, Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Color Theme toggle: Light / Dark */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
          className="p-2 rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1A1E24] hover:text-[#111827] dark:hover:text-[#F3F3EF] border border-transparent hover:border-[#E5E7EB] dark:hover:border-[#262A32] transition-all cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4B5563]" />}
        </button>

        {/* Notifications */}
        <button
          title="Уведомления"
          className="relative p-2 rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1A1E24] transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#121418]"></span>
        </button>

        {/* Quick Role Switcher for Everyone */}
        <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-xl bg-gray-100 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-xs">
          <button
            type="button"
            onClick={() => onSwitchRole('student')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentUser.role === 'student'
                ? 'bg-white dark:bg-[#252B35] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Переключиться в режим Студента"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Студент</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchRole('teacher')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentUser.role === 'teacher'
                ? 'bg-white dark:bg-[#252B35] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
            title="Переключиться в режим Преподавателя"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Преподаватель</span>
          </button>
          {(isSuperAdmin || currentUser.role === 'admin') && (
            <button
              type="button"
              onClick={() => onSwitchRole('admin')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                currentUser.role === 'admin'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-xs border border-rose-200 dark:border-rose-900/60'
                  : 'text-rose-500 hover:text-rose-700'
              }`}
              title="Режим Администратора"
            >
              <Shield className="w-3 h-3 text-rose-500" />
              <span>Админ</span>
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Profile with Interactive Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full text-white font-semibold text-xs flex items-center justify-center shadow-xs overflow-hidden ${
              currentUser.role === 'teacher'
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                : currentUser.role === 'admin'
                ? 'bg-gradient-to-tr from-rose-600 to-orange-500'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-500'
            }`}>
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'СТ'
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] leading-tight">
                {currentUser.name || 'Студент'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${badge.bg}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  Гр. {currentUser.group}
                </span>
              </div>
            </div>
          </button>

          {/* Profile Popover Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 shadow-xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-100 dark:border-gray-800/80">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  {currentUser.email || 'Авторизован через Study OS'}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Группа: {currentUser.group}
                  </span>
                </div>
              </div>

              {/* Role switcher for Everyone */}
              <div className="space-y-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-500" />
                    Режим роли:
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {currentUser.role === 'admin' ? 'Администратор' : currentUser.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                  </span>
                </div>
                <div className={`grid gap-1 ${(isSuperAdmin || currentUser.role === 'admin') ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {(['student', 'teacher'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onSwitchRole(r);
                        setProfileOpen(false);
                      }}
                      className={`py-1 px-1.5 text-[10px] rounded-lg font-semibold transition-colors cursor-pointer ${
                        currentUser.role === r
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {r === 'student' ? 'Студент' : 'Преподаватель'}
                    </button>
                  ))}
                  {(isSuperAdmin || currentUser.role === 'admin') && (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('admin');
                        setProfileOpen(false);
                      }}
                      className={`py-1 px-1.5 text-[10px] rounded-lg font-semibold transition-colors cursor-pointer ${
                        currentUser.role === 'admin'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      Админ
                    </button>
                  )}
                </div>
              </div>

              {/* Guest banner / permanent account link */}
              {(!currentUser.email || currentUser.id.startsWith('usr-guest-')) && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Войти / Сохранить прогресс</span>
                  </button>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-800 pt-1 space-y-1">
                {/* Logout button */}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти из аккаунта</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
