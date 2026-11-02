import React from 'react';
import { Home, Layers, Calendar, User as UserIcon, Shield, Users, FileText } from 'lucide-react';
import { NavTab } from './Sidebar';
import { User } from '../types';
import { isSuperAdminEmail } from '../lib/supabase';

interface MobileNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser?: User;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser
}) => {
  const isAdmin = currentUser?.role === 'admin' || isSuperAdminEmail(currentUser?.email, currentUser?.name);
  const isTeacher = currentUser?.role === 'teacher';

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Главная', icon: Home },
    ...(isAdmin ? [{ id: 'admin' as NavTab, label: 'Админ', icon: Shield }] : []),
    ...(isTeacher || isAdmin ? [{ id: 'teacher' as NavTab, label: 'Журнал', icon: Users }] : []),
    ...(!isAdmin && !isTeacher ? [
      { id: 'subjects' as NavTab, label: 'Предметы', icon: Layers },
      { id: 'labs' as NavTab, label: 'Практикум', icon: FileText }
    ] : isTeacher ? [
      { id: 'subjects' as NavTab, label: 'Предметы', icon: Layers }
    ] : []),
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'settings', label: 'Профиль', icon: UserIcon },
  ];

  return (
    <nav 
      aria-label="Мобильная навигация"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#262A32] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg transition-colors"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] py-1 px-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isActive
                ? 'text-[#2563EB] dark:text-[#60A5FA]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
              <Icon className="w-5 h-5 shrink-0" />
            </div>
            <span className={`text-[10px] tracking-tight truncate max-w-[56px] text-center ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
