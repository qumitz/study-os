import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Loader2, 
  Sun, 
  Moon, 
  Database
} from 'lucide-react';
import { User, UserRole } from '../types';
import { availableGroups } from '../data/mockData';
import { 
  isSupabaseConfigured, 
  signInWithSupabase, 
  signUpWithSupabase, 
  signInWithGoogleOAuth,
  signInWithAppleOAuth 
} from '../lib/supabase';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  isDarkMode,
  setIsDarkMode
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('37В');

  // Loading & error feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasSupabase = isSupabaseConfigured();

  // Submit Handler for Email/Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
          }
        } else {
          // Register
          if (!name.trim()) {
            setErrorMessage('Пожалуйста, укажите ваше ФИО');
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
            setSuccessMessage('Учётная запись успешно создана!');
            setTimeout(() => {
              onLogin(user);
            }, 800);
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Произошла ошибка при обращении к серверу');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Local offline login fallback
    const groupObj = availableGroups.find(g => g.name === selectedGroupId || g.id === selectedGroupId) || availableGroups[0];
    const localUser: User = {
      id: 'usr-' + Date.now(),
      name: name.trim() || email.split('@')[0] || 'Пользователь',
      email: email,
      role: selectedRole,
      group: groupObj.name,
      course: groupObj.course
    };

    onLogin(localUser);
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
    <div className="min-h-screen flex flex-col justify-between bg-[#FBFBFA] dark:bg-[#0D0F14] text-[#111827] dark:text-[#F3F3EF] transition-colors duration-200 p-4 sm:p-6 lg:p-8">
      {/* Top Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] block leading-tight">
              Study OS
            </span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#8E95A2]">
              Лидский колледж УО «ГрГУ им. Янки Купалы»
            </span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
          className="p-2 rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:bg-gray-100 dark:hover:bg-[#1A1E24] hover:text-[#111827] dark:hover:text-[#F3F3EF] border border-gray-200 dark:border-gray-800 transition-all cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#4B5563]" />}
        </button>
      </header>

      {/* Main Login / Register Card */}
      <main className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#15181E] border border-gray-200 dark:border-[#262A32] rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Card Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F3F3EF]">
              {authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация в Study OS'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {authMode === 'login' 
                ? 'Войдите для доступа к конспектам, тестам и расписанию' 
                : 'Создайте аккаунт студента или преподавателя группы 37В'}
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white dark:bg-[#252B35] text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white dark:bg-[#252B35] text-gray-900 dark:text-white shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Регистрация
            </button>
          </div>

          {/* Fast Social Login Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] hover:bg-gray-50 dark:hover:bg-[#20252D] transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.36 7.34 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"/>
              </svg>
              <span>Продолжить с Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-[#111827] dark:text-[#F3F3EF] hover:bg-gray-50 dark:hover:bg-[#20252D] transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.9.04-2 .6-2.65 1.36-.58.65-1.09 1.71-.96 2.74 1.01.08 2.02-.51 2.6-1.23z"/>
              </svg>
              <span>Продолжить с Apple</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 dark:border-gray-800 w-full"></div>
            <span className="absolute px-3 text-[11px] uppercase tracking-wider font-semibold text-gray-400 bg-white dark:bg-[#15181E]">
              или по почте
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name in Register mode */}
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                  ФИО (Фамилия Имя Отчество):
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Электронная почта:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Пароль:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Register specifics: Group & Role */}
            {authMode === 'register' && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                    Учебная группа:
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {availableGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        Группа {g.name} ({g.course} курс)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                    Роль:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedRole === 'student'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Студент</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('teacher')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedRole === 'teacher'
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Преподаватель</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Проверка данных...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Войти в Study OS' : 'Зарегистрироваться'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Supabase status badge */}
          <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800/80">
            {hasSupabase ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Облачная база Supabase подключена
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Локальный режим
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-3">
        Study OS • Лидский колледж УО «ГрГУ им. Янки Купалы» • 2026
      </footer>
    </div>
  );
};
