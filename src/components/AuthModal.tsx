import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Users, 
  ArrowRight, 
  Shield, 
  GraduationCap, 
  Check, 
  AlertCircle, 
  Loader2, 
  Database, 
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getAvailableGroups } from '../lib/groupRegistry';
import { 
  isSupabaseConfigured, 
  getSupabaseCredentials, 
  setSupabaseCredentials, 
  signInWithSupabase, 
  signUpWithSupabase, 
  signInWithGoogleOAuth,
  signInWithAppleOAuth 
} from '../lib/supabase';

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

  const availableGroups = getAvailableGroups();

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'student');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(currentUser.group || '37В');

  // Supabase status & config UI state
  const [hasSupabase, setHasSupabase] = useState<boolean>(isSupabaseConfigured());
  const [showDbConfig, setShowDbConfig] = useState<boolean>(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(getSupabaseCredentials().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(getSupabaseCredentials().key);
  const [dbConfigSavedMessage, setDbConfigSavedMessage] = useState<string | null>(null);

  // Loading & error feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setHasSupabase(isSupabaseConfigured());
    const creds = getSupabaseCredentials();
    setSupabaseUrlInput(creds.url);
    setSupabaseKeyInput(creds.key);
  }, [isOpen]);

  const handleRoleQuickSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSaveDbConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseCredentials(supabaseUrlInput, supabaseKeyInput);
    const configured = isSupabaseConfigured();
    setHasSupabase(configured);
    if (configured) {
      setDbConfigSavedMessage('Подключение к Supabase успешно сохранено!');
      setTimeout(() => setDbConfigSavedMessage(null), 3000);
      setShowDbConfig(false);
    } else {
      setDbConfigSavedMessage('Настройки очищены (активен демо-режим)');
      setTimeout(() => setDbConfigSavedMessage(null), 3000);
    }
  };

  // Submit Handler for Email/Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // If Supabase is connected, execute real Auth
    if (hasSupabase) {
      setIsLoading(true);
      try {
        if (authMode === 'login') {
          if (!email || !password) {
            setErrorMessage('Пожалуйста, введите email и пароль');
            setIsLoading(false);
            return;
          }

          const { user, error } = await signInWithSupabase(email, password);
          if (error) {
            setErrorMessage(error);
          } else if (user) {
            onLogin(user);
            onClose();
          }
        } else {
          // Register
          if (!name.trim()) {
            setErrorMessage('Пожалуйста, укажите ваше имя или ФИО');
            setIsLoading(false);
            return;
          }
          if (!email || !password) {
            setErrorMessage('Пожалуйста, заполните email и пароль');
            setIsLoading(false);
            return;
          }
          if (password.length < 6) {
            setErrorMessage('Пароль должен содержать минимум 6 символов');
            setIsLoading(false);
            return;
          }

          const groupObj = availableGroups.find(g => g.name === selectedGroupId || g.id === selectedGroupId) || availableGroups[0];
          const { user, error } = await signUpWithSupabase({
            email,
            password,
            name: name.trim(),
            role: selectedRole,
            group: groupObj.name,
            course: groupObj.course
          });

          if (error) {
            setErrorMessage(error);
          } else if (user) {
            setSuccessMessage('Успешная регистрация! Выполняется вход...');
            setTimeout(() => {
              onLogin(user);
              onClose();
            }, 600);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Произошла непредвиденная ошибка');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Fallback: Local offline login
    const groupObj = availableGroups.find(g => g.name === selectedGroupId || g.id === selectedGroupId) || availableGroups[0];
    
    const loggedInUser: User = {
      id: 'usr-' + Date.now(),
      name: name.trim() || email.split('@')[0] || 'Пользователь',
      email: email,
      role: selectedRole,
      group: groupObj.name,
      course: groupObj.course
    };

    onLogin(loggedInUser);
    onClose();
  };

  // Google OAuth
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { error } = await signInWithGoogleOAuth();
    if (error) {
      setErrorMessage(`Ошибка входа через Google: ${error}`);
      setIsLoading(false);
    }
  };

  // Apple OAuth
  const handleAppleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { error } = await signInWithAppleOAuth();
    if (error) {
      setErrorMessage(`Ошибка входа через Apple: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-base shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F3EF]">
                  {authMode === 'login' ? 'Вход в Study OS' : 'Регистрация в Study OS'}
                </h2>
                {hasSupabase ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Supabase Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                    Локальный режим
                  </span>
                )}
              </div>
              <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                Лидский колледж УО «ГрГУ им. Янки Купалы»
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Login / Register */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-[#1A1E24] border border-gray-200/80 dark:border-gray-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'login'
                ? 'bg-white dark:bg-[#252A34] text-[#111827] dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Вход по паролю
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
            className={`py-2 rounded-lg transition-all ${
              authMode === 'register'
                ? 'bg-white dark:bg-[#252A34] text-[#111827] dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Новый аккаунт (Регистрация)
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* If registering, collect Name */}
          {authMode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1 block">
                ФИО (Фамилия Имя):
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иванов Алексей Сергеевич"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 font-medium"
                />
              </div>
            </div>
          )}

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] block">
              {authMode === 'register' ? 'Роль в колледже:' : 'Войти под ролью:'}
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
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
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

          {/* Group selector */}
          {selectedRole === 'student' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] block">
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
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1 block">
              Электронная почта:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@grsu.by"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 font-medium"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] mb-1 block">
              Пароль:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 font-medium"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Синхронизация...</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'login' 
                    ? `Войти как ${selectedRole === 'student' ? 'Студент' : selectedRole === 'teacher' ? 'Преподаватель' : 'Администратор'}`
                    : 'Зарегистрироваться и войти'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Login Options */}
        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="relative flex items-center justify-center -mt-3.5 mb-2">
            <span className="px-2 text-[10px] uppercase font-semibold text-gray-400 bg-white dark:bg-[#15181E]">
              Быстрый вход через сервисы
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] hover:bg-gray-50 dark:hover:bg-[#20252D] transition-colors shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] hover:bg-gray-50 dark:hover:bg-[#20252D] transition-colors shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.9.04-2 .6-2.65 1.36-.58.65-1.09 1.71-.96 2.74 1.01.08 2.02-.51 2.6-1.23z"/>
              </svg>
              <span>Apple ID</span>
            </button>
          </div>
        </div>

        {/* Collapsible Supabase Settings */}
        <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setShowDbConfig(!showDbConfig)}
            className="w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-[#2563EB]" />
              Настройки подключения Supabase
            </span>
            {showDbConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDbConfig && (
            <form onSubmit={handleSaveDbConfig} className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-800 space-y-2.5 animate-in fade-in">
              <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Введите URL и Anon Key из панели <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">supabase.com</a> (Project Settings &rarr; API) для подключения реальной базы данных:
              </div>

              <div>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#121418] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#121418] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              {dbConfigSavedMessage && (
                <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {dbConfigSavedMessage}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-colors"
                >
                  Сохранить ключи
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSupabaseUrlInput('');
                    setSupabaseKeyInput('');
                    setSupabaseCredentials('', '');
                    setHasSupabase(false);
                    setDbConfigSavedMessage('Настройки очищены');
                    setTimeout(() => setDbConfigSavedMessage(null), 2000);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
