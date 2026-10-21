import React from 'react';
import { 
  User as UserIcon, 
  Moon, 
  Sun, 
  Monitor, 
  ShieldCheck, 
  GraduationCap, 
  Check, 
  Lock, 
  Volume2, 
  Info,
  LogOut,
  Sliders,
  Type
} from 'lucide-react';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenAuth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  isDarkMode,
  setIsDarkMode,
  onOpenAuth,
}) => {
  const [fontSize, setFontSize] = React.useState<'normal' | 'comfortable' | 'large'>('comfortable');
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);
  const [timerAlert, setTimerAlert] = React.useState<boolean>(true);

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
          Управление профилем, оформлением и параметрами обучения в Study OS
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
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-medium text-gray-500">ФИО пользователя</span>
              <p className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                {currentUser.name}
              </p>
              <span className="text-xs text-gray-400">{currentUser.email}</span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 space-y-1">
              <span className="text-[11px] font-medium text-gray-500">Учебная группа</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#2563EB] dark:text-[#60A5FA]">
                  {currentUser.group}
                </span>
                <span className="text-xs text-gray-400">• {currentUser.course} курс</span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                Лидский колледж УО «ГрГУ им. Янки Купалы»
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800/80">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Выбор групп ограничен группой 37В на этапе пилотного тестирования</span>
            </div>
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Сменить аккаунт или группу</span>
            </button>
          </div>
        </div>

        {/* Section 2: Оформление и тема */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <Sun className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
            <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Оформление интерфейса
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setIsDarkMode(false)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                !isDarkMode
                  ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-[#2563EB]/20 shadow-xs'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
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
                  <span className="text-xs text-gray-500">
                    Чистый светлый фон для дневных занятий
                  </span>
                </div>
              </div>
              {!isDarkMode && <Check className="w-4 h-4 text-[#2563EB]" />}
            </button>

            <button
              onClick={() => setIsDarkMode(true)}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                isDarkMode
                  ? 'border-[#3B82F6] bg-blue-950/30 ring-2 ring-[#3B82F6]/30 shadow-xs'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
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
                  <span className="text-xs text-gray-500">
                    Снижает нагрузку на зрение в темноте
                  </span>
                </div>
              </div>
              {isDarkMode && <Check className="w-4 h-4 text-[#60A5FA]" />}
            </button>
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
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
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
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB]"
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
                className="w-4 h-4 text-[#2563EB] rounded border-gray-300 focus:ring-[#2563EB]"
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
            Ваш прогресс прохождения курса «Основы информационной безопасности» и полученные баллы надёжно хранятся в постоянном изолированном хранилище браузера (<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px] font-mono text-gray-700 dark:text-gray-300">study_os_progress_37v</code>). Кнопка случайного сброса отключена для предотвращения непреднамеренной потери данных.
          </p>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>При необходимости пересдать тест обратитесь к преподавателю — он может сбросить отдельную тему в своём кабинете.</span>
          </div>
        </div>

        {/* Section 5: О платформе */}
        <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-[#14161C] border border-[#E5E7EB] dark:border-[#262A32] flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span>Study OS • Версия 1.2 (Колледж-Релиз)</span>
          </div>
          <span>Лида, 2026</span>
        </div>
      </div>
    </div>
  );
};
