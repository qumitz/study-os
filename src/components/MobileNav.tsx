import React from 'react';
import { Home, Layers, Calendar, User } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Главная', icon: Home },
    { id: 'subjects' as NavTab, label: 'Предметы', icon: Layers },
    { id: 'schedule' as NavTab, label: 'Расписание', icon: Calendar },
    { id: 'settings' as NavTab, label: 'Профиль', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121418]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#262A32] px-4 py-2 flex items-center justify-around shadow-lg transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive
                ? 'text-[#2563EB] dark:text-[#60A5FA]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
