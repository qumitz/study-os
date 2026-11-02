import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Moon, 
  Sun, 
  ShieldCheck, 
  GraduationCap, 
  Check, 
  Lock, 
  Info,
  LogOut,
  Sliders,
  Type,
  Edit2,
  Users
} from 'lucide-react';
import { User, UserRole } from '../types';
import { 
  isSupabaseConfigured, 
  updateUserProfileName,
  isSuperAdminEmail 
} from '../lib/supabase';

interface SettingsViewProps {
  currentUser: User;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenAuth: () => void;
  onUpdateUser?: (user: User) => Promise<void> | void;
  onSwitchRole?: (role: UserRole) => void;
  isSuperAdmin?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  isDarkMode,
  setIsDarkMode,
  onOpenAuth,
  onUpdateUser,
  onSwitchRole,
  isSuperAdmin = false
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'comfortable' | 'large'>('comfortable');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [timerAlert, setTimerAlert] = useState<boolean>(true);

  // Full Name (ФИО) edit state
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [fullNameInput, setFullNameInput] = useState<string>(currentUser.name || '');
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [nameSaveFeedback, setNameSaveFeedback] = useState<string | null>(null);

  const isAdmin = isSuperAdmin || currentUser.role === 'admin' || isSuperAdminEmail(currentUser.email, currentUser.name);

  useEffect(() => {
    setFullNameInput(currentUser.name || '');
  }, [currentUser.name]);

  const handleSaveFullName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = fullNameInput.trim();
    if (!trimmed) return;

    setIsSavingName(true);
    setNameSaveFeedback(null);

    const updatedUser: User = {
      ...currentUser,
      name: trimmed
    };

    if (onUpdateUser) {
      await onUpdateUser(updatedUser);
    }

    if (isSupabaseConfigured() && currentUser.id) {
      await updateUserProfileName(currentUser.id, trimmed);
    }

    setIsSavingName(false);
    setIsEditingName(false);
    setNameSaveFeedback('ФИО успешно сохранено!');
    setTimeout(() => setNameSaveFeedback(null), 3500);
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[#E5E7EB] dark:border-[#262A32] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#F3F3EF] tracking-tight">
            Настройки
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8E95A2]">
          Управление профилем, оформлением и параметрами обучения
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Профиль и учебная группа */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Профиль и учебная группа
              </h2>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              currentUser.role === 'teacher'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : currentUser.role === 'admin'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                : 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA]'
            }`}>
              {currentUser.role === 'teacher' ? 'Преподаватель' : currentUser.role === 'admin' ? 'Администратор' : 'Студент'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isEditingName ? (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-gray-500">ФИО пользователя</span>
                  <p className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                    {currentUser.name}
                  </p>
                  <span className="text-xs text-gray-400 block">{currentUser.email || 'Вход не выполнен'}</span>
                  {nameSaveFeedback && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ {nameSaveFeedback}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-[#20252D] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-[#2563EB]" />
                  <span>Изменить</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveFullName} className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-blue-200 dark:border-blue-900/60 space-y-2.5 animate-in fade-in">
                <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
                  Изменить ФИО:
                </label>
                <input
                  type="text"
                  required
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder="Ваше ФИО"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-[#121418] border border-gray-300 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  autoFocus
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSavingName || !fullNameInput.trim()}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSavingName ? 'Сохранение...' : 'Сохранить'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFullNameInput(currentUser.name);
                      setIsEditingName(false);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-medium text-gray-500">
                {currentUser.role === 'teacher' ? 'Учебные группы' : 'Учебная группа'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#2563EB] dark:text-[#60A5FA]">
                  {currentUser.role === 'teacher' ? 'Все группы колледжа' : currentUser.group}
                </span>
                {currentUser.role !== 'teacher' && (
                  <span className="text-xs text-gray-400">• {currentUser.course} курс</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                Лидский колледж УО «ГрГУ им. Янки Купалы»
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800/80">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {currentUser.role === 'teacher' 
                  ? 'Преподавателю доступны журналы всех групп колледжа'
                  : `Выбор группы: ${currentUser.group} (ПОИТ/ТЭСВТ)`}
              </span>
            </div>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Сменить аккаунт или группу</span>
            </button>
          </div>
        </div>

        {/* Role & Access Mode Management - Strictly for Administrator */}
        {isAdmin && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                    Режим доступа и роль в системе
                  </h2>
                  <p className="text-xs text-gray-500">
                    Переключение между студенческим кабинетом, журналом преподавателя и управлением
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                Super Admin
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 space-y-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Выберите активный режим:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSwitchRole && onSwitchRole('student')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentUser.role === 'student'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1E232B]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Режим Студента</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchRole && onSwitchRole('teacher')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentUser.role === 'teacher'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1E232B]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Режим Преподавателя</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchRole && onSwitchRole('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    currentUser.role === 'admin'
                      ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1E232B]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Режим Администратора</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 pt-1">
                В режиме Преподавателя доступен журнал группы 37В, карточки учащихся и редактирование конспектов с иллюстрациями. В режиме Студента — прохождение тестов и изучение материалов.
              </p>
            </div>
          </div>
        )}

        {/* Section 2: Оформление и тема */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Оформление интерфейса
              </h2>
            </div>
            <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
              Тема: {isDarkMode ? 'Тёмная' : 'Светлая'}
            </span>
          </div>

          {/* Выбор цветовой темы */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Цветовая тема оформления:
              </span>
              <span className="text-[11px] text-gray-500">
                Выберите комфортную тему для работы с конспектами и тестированием
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Светлая тема */}
              <button
                type="button"
                onClick={() => setIsDarkMode(false)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  !isDarkMode
                    ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-[#2563EB]/25 shadow-xs'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-gray-800 text-amber-600 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] block">
                      Светлая тема
                    </span>
                    <span className="text-[11px] text-gray-500 leading-snug block mt-0.5">
                      Чистый светлый фон для дневных занятий
                    </span>
                  </div>
                </div>
                {!isDarkMode && <Check className="w-4 h-4 text-[#2563EB]" />}
              </button>

              {/* Тёмная тема */}
              <button
                type="button"
                onClick={() => setIsDarkMode(true)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isDarkMode
                    ? 'border-[#3B82F6] bg-blue-950/30 ring-2 ring-[#3B82F6]/30 shadow-xs'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] block">
                      Тёмная тема
                    </span>
                    <span className="text-[11px] text-gray-500 leading-snug block mt-0.5">
                      Глубокий контрастный фон, снижает нагрузку на зрение
                    </span>
                  </div>
                </div>
                {isDarkMode && <Check className="w-4 h-4 text-[#60A5FA]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Комфорт чтения конспектов */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <Type className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
            <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Чтение конспектов и тестирование
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                Размер шрифта в лекциях
              </span>
              <div className="grid grid-cols-3 gap-2 max-w-sm">
                {(['normal', 'comfortable', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      fontSize === size
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {size === 'normal' ? 'Обычный' : size === 'comfortable' ? 'Комфортный' : 'Крупный'}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] block">
                  Звуковые сигналы при завершении теста
                </span>
                <span className="text-xs text-gray-500">
                  Воспроизводить негромкий клик при отправке результата
                </span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB] cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] block">
                  Предупреждение о дедлайне таймера
                </span>
                <span className="text-xs text-gray-500">
                  Визуальный сигнал за 2 минуты до окончания 15-минутного лимита
                </span>
              </div>
              <input
                type="checkbox"
                checked={timerAlert}
                onChange={(e) => setTimerAlert(e.target.checked)}
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Защита данных и прогресса */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Сохранность учебного прогресса
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Защищено
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8E95A2] leading-relaxed">
            Ваш прогресс прохождения предметов и полученные баллы за тесты автоматически кэшируются в защищённом хранилище браузера и мгновенно синхронизируются с базой данных Supabase при подключении.
          </p>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Тест сдаётся 1 раз. При необходимости пересдачи преподаватель может сбросить попытку в журнале оценок.</span>
          </div>
        </div>

        {/* Section 5: О платформе */}
        <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-[#14161C] border border-[#E5E7EB] dark:border-[#262A32] flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span>Study OS • Версия 1.3 (Supabase Cloud + 37В)</span>
          </div>
          <span>Лида, 2026</span>
        </div>
      </div>
    </div>
  );
};
