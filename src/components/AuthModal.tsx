import React, { useState } from 'react';
import { X, Lock, Mail, Users, ArrowRight, Shield, GraduationCap, Check } from 'lucide-react';
import { User, UserRole } from '../types';
import { availableGroups, initialUsers } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  currentUser: User;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(currentUser.group);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleQuickSelect = (role: UserRole) => {
    setSelectedRole(role);
    const mock = initialUsers[role];
    if (mock) {
      setEmail(mock.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUser = initialUsers[selectedRole];
    const groupObj = availableGroups.find(g => g.name === selectedGroupId || g.id === selectedGroupId) || availableGroups[0];
    
    const loggedInUser: User = {
      ...baseUser,
      email: email || baseUser.email,
      group: groupObj.name,
      course: groupObj.course
    };

    onLogin(loggedInUser);
    onClose();
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Quick login with provider
    const baseUser = initialUsers[selectedRole];
    onLogin({
      ...baseUser,
      email: provider === 'google' ? `${baseUser.name.toLowerCase()}@gmail.com` : `${baseUser.name.toLowerCase()}@icloud.com`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F3EF]">
                Вход в Study OS
              </h2>
              <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                Лидский колледж УО «ГрГУ им. Янки Купалы»
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Quick Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block">
            Выберите роль:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'student' as UserRole, label: 'Студент', icon: GraduationCap },
              { id: 'teacher' as UserRole, label: 'Преподаватель', icon: Users },
              { id: 'admin' as UserRole, label: 'Админ', icon: Shield },
            ].map(r => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleQuickSelect(r.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/70 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] font-bold shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1E24]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[11px] truncate w-full text-center">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block">
            Учебная группа:
          </label>
          <div className="relative">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 appearance-none cursor-pointer"
            >
              {availableGroups.map(g => (
                <option key={g.id} value={g.name}>
                  Группа {g.name} — 3 курс ({g.specialty.split('(')[0]})
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-3 pointer-events-none text-gray-400 text-xs">
              ▼
            </div>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
            Сменить группу всегда можно в профиле справа сверху.
          </span>
        </div>

        {/* Social Auth Buttons (Google & Apple) */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] hover:bg-gray-50 dark:hover:bg-[#20252D] transition-colors shadow-xs"
          >
            {/* Google SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>Войти через Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] hover:bg-gray-50 dark:hover:bg-[#20252D] transition-colors shadow-xs"
          >
            {/* Apple SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.66-7.85-11.88-14.34-6.8-10.45-12.01-21.99-15.65-34.62-3.63-12.63-5.46-24.36-5.46-35.19 0-14.82 3.62-27.27 10.87-37.36 7.25-10.09 16.59-15.22 28.02-15.39 4.8 0 10.23 1.25 16.29 3.75 6.06 2.5 10.07 3.81 12.04 3.93 1.76-.12 6.04-1.55 12.85-4.3 6.81-2.74 12.5-4.01 17.06-3.81 13.9.87 24.69 5.86 32.36 14.97-12.18 7.37-18.15 17.38-17.9 30.04.25 10.23 4.13 18.73 11.65 25.49 7.52 6.76 16.48 10.66 26.88 11.7-2.27 6.88-5.06 14.07-8.36 21.57zM119.22 33.15c0-7.39 2.66-14.4 7.97-21.03 5.31-6.63 11.83-11.08 19.57-13.35-.12 1.37-.3 2.76-.54 4.17-.63 3.99-2.02 8.01-4.17 12.05-2.15 4.04-5.06 7.39-8.73 10.05-3.67 2.66-7.54 4.39-11.61 5.19-.38-2.37-.49-4.73-.49-7.08z"/>
            </svg>
            <span>Войти через Apple ID</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          <span className="absolute px-2 text-[10px] uppercase font-semibold text-gray-400 bg-white dark:bg-[#15181E]">
            или по почте
          </span>
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Электронная почта"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs mt-2 flex items-center justify-center gap-2"
          >
            <span>Войти как {selectedRole === 'student' ? 'Студент' : selectedRole === 'teacher' ? 'Преподаватель' : 'Администратор'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
