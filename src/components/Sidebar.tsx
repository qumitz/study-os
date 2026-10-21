import { 
  Home, 
  Layers, 
  Calendar, 
  ClipboardList, 
  CheckSquare, 
  FlaskConical, 
  Award, 
  Settings,
  Users,
  GraduationCap,
  Shield
} from 'lucide-react';
import { User } from '../types';

export type NavTab = 'dashboard' | 'subjects' | 'schedule' | 'tasks' | 'tests' | 'labs' | 'achievements' | 'settings' | 'teacher';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser?: User;
  groupName?: string;
  course?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  groupName = '37В',
  course = 3
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Главная', icon: Home },
    ...(currentUser?.role === 'teacher' ? [{ id: 'teacher' as NavTab, label: 'Журнал 37В', icon: Users }] : []),
    { id: 'subjects' as NavTab, label: 'Предметы', icon: Layers },
    { id: 'schedule' as NavTab, label: 'Расписание', icon: Calendar },
    { id: 'tests' as NavTab, label: 'Тесты и ОКР', icon: CheckSquare },
    { id: 'settings' as NavTab, label: 'Настройки', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-[#E5E7EB] dark:border-[#262A32] bg-[#FFFFFF] dark:bg-[#121418] h-screen sticky top-0 p-4 justify-between transition-colors duration-200">
      <div className="flex flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-base text-[#111827] dark:text-[#F3F3EF] tracking-tight">Study OS</span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#8E95A2]">Колледж • Лида</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#F0F5FF] text-[#2563EB] dark:bg-[#1E293B] dark:text-[#60A5FA] font-semibold shadow-xs'
                    : 'text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#F3F4F6] dark:hover:bg-[#1A1E24] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB] dark:text-[#60A5FA]' : 'text-[#6B7280] dark:text-[#9CA3AF]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User/Group Widget */}
      <div className="p-3.5 rounded-2xl bg-[#F9FAFB] dark:bg-[#181B21] border border-[#E5E7EB] dark:border-[#262A32] flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
          currentUser?.role === 'teacher'
            ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-900/40 dark:text-indigo-400'
            : currentUser?.role === 'admin'
            ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/60 dark:border-rose-900/40 dark:text-rose-400'
            : 'bg-blue-50 border-blue-100 text-[#2563EB] dark:bg-blue-950/60 dark:border-blue-900/40 dark:text-[#60A5FA]'
        }`}>
          {currentUser?.role === 'teacher' ? <Users className="w-5 h-5" /> : currentUser?.role === 'admin' ? <Shield className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xs text-[#6B7280] dark:text-[#8E95A2] leading-tight">
            {currentUser?.role === 'teacher' ? 'Преподаватель' : currentUser?.role === 'admin' ? 'Администратор' : `${course} курс`}
          </span>
          <span className="text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] leading-tight truncate">
            {currentUser?.name || `3 курс`}
          </span>
          <span className="text-[11px] font-medium text-[#2563EB] dark:text-[#60A5FA] truncate mt-0.5">
            Группа: {groupName}
          </span>
        </div>
      </div>
    </aside>
  );
};
