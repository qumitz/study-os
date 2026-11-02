import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { GraduationCap, Users, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { getAvailableGroups } from '../lib/groupRegistry';

interface OnboardingModalProps {
  user: User;
  onComplete: (updatedUser: User) => Promise<void> | void;
  onLogout: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  user,
  onComplete,
  onLogout
}) => {
  const availableGroups = getAvailableGroups();
  const [fullName, setFullName] = useState<string>(user.name || '');
  const [selectedGroup, setSelectedGroup] = useState<string>(user.group || '37В');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role || 'student');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setError('Пожалуйста, укажите ваше реальное ФИО');
      return;
    }

    setIsLoading(true);
    setError(null);

    const groupObj = availableGroups.find(g => g.name === selectedGroup || g.id === selectedGroup) || availableGroups[0];

    const updatedUser: User = {
      ...user,
      name: trimmed,
      group: groupObj.name,
      course: groupObj.course,
      role: selectedRole,
      needsOnboarding: false
    };

    try {
      await onComplete(updatedUser);
    } catch (err: any) {
      setError(err?.message || 'Не удалось сохранить профиль');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] mx-auto flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] dark:text-[#F3F3EF] tracking-tight">
            Добро пожаловать в Study OS!
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Для добавления в журнал группы и отображения оценок укажите свои данные.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account email info */}
          {user.email && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Google
              </span>
            </div>
          )}

          {/* Full Name (ФИО) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Ваше ФИО (Фамилия Имя Отчество):
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Например: Иванов Иван Иванович"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              autoFocus
            />
            <span className="text-[11px] text-gray-400 block">
              Преподаватель увидит это имя в журнале успеваемости
            </span>
          </div>

          {/* Group Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Учебная группа:
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-gray-200 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
            >
              {availableGroups.map((g) => (
                <option key={g.id} value={g.name}>
                  Группа {g.name} ({g.course} курс — ПОИТ / ТЭСВТ)
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Ваша роль в колледже:
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

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading || !fullName.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Сохранение профиля...</span>
                </>
              ) : (
                <>
                  <span>Войти в Study OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              Использовать другой аккаунт
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
