import React from 'react';
import { 
  BookOpen, 
  ClipboardList, 
  Calendar, 
  ChevronRight, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Cpu,
  Wrench,
  Network,
  Radio,
  Smartphone,
  Compass,
  Server,
  GraduationCap
} from 'lucide-react';
import { Subject, StudentProgress } from '../types';

interface DashboardProps {
  subjects?: Subject[];
  securitySubject?: Subject;
  progress?: StudentProgress;
  allProgress?: Record<string, StudentProgress>;
  onSelectSubject?: (subject: Subject) => void;
  onOpenSubject?: () => void;
  onOpenSchedule: () => void;
  onOpenTests: () => void;
}

const getSubjectMeta = (subjectId: string) => {
  switch (subjectId) {
    case 'secbasics':
      return {
        icon: ShieldCheck,
        badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        iconBg: 'bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-[#60A5FA]',
        tag: 'ИБ и защита'
      };
    case 'pms':
      return {
        icon: Cpu,
        badgeBg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        iconBg: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
        tag: 'Микроконтроллеры'
      };
    case 'tesvt':
      return {
        icon: Wrench,
        badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        iconBg: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
        tag: 'ТО и Ремонт'
      };
    case 'stoi':
      return {
        icon: Network,
        badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
        iconBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
        tag: 'Сети и маршрутизация'
      };
    case 'pspi':
      return {
        icon: Radio,
        badgeBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
        iconBg: 'bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400',
        tag: 'Телекоммуникации'
      };
    case 'rmp':
      return {
        icon: Smartphone,
        badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
        iconBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
        tag: 'Android & Kotlin'
      };
    case 'sapr':
      return {
        icon: Compass,
        badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
        iconBg: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
        tag: 'САПР и схемотехника'
      };
    case 'tsi':
      return {
        icon: Server,
        badgeBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        iconBg: 'bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400',
        tag: 'Аппаратные средства'
      };
    default:
      return {
        icon: BookOpen,
        badgeBg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        iconBg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        tag: 'Дисциплина'
      };
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  subjects,
  securitySubject,
  progress,
  allProgress = {},
  onSelectSubject,
  onOpenSubject,
  onOpenSchedule,
  onOpenTests
}) => {
  const subjectList: Subject[] = subjects && subjects.length > 0 
    ? subjects 
    : (securitySubject ? [securitySubject] : []);

  const primarySubject = subjectList[0] || securitySubject;

  // Compute aggregate metrics across all subjects
  let totalTopics = 0;
  let completedTopics = 0;
  let totalPracticals = 0;

  subjectList.forEach((s) => {
    totalTopics += s.topics.length;
    totalPracticals += s.practicalWorks.length;
    const subjProgress = allProgress[s.id] || (s.id === securitySubject?.id ? progress : undefined);
    if (subjProgress) {
      s.topics.forEach((t) => {
        if (subjProgress.topicStatuses[t.id] === 'completed') {
          completedTopics++;
        }
      });
    }
  });

  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleCardClick = (subj: Subject) => {
    if (onSelectSubject) {
      onSelectSubject(subj);
    } else if (onOpenSubject) {
      onOpenSubject();
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#F3F3EF] tracking-tight">
          Привет, Алексей! 👋
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8E95A2]">
          Учебная группа {primarySubject?.group || '37В'} • Лидский колледж УО «ГрГУ им. Янки Купалы»
        </p>
      </div>

      {/* 4 KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Общий прогресс */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              Общий прогресс
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
              {progressPercent}%
            </div>
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-3 overflow-hidden">
              <div 
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Завершено тем */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              Завершено тем
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
              {completedTopics} <span className="text-sm font-normal text-gray-400">/ {totalTopics}</span>
            </div>
            <span className="inline-block mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {totalTopics - completedTopics > 0 ? `Осталось ${totalTopics - completedTopics} тем` : 'Все темы изучены!'}
            </span>
          </div>
        </div>

        {/* KPI 3: Практические работы */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              Практические работы
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
              {totalPracticals} <span className="text-sm font-normal text-gray-400">работ</span>
            </div>
            <span className="inline-block mt-2 text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              По КТП Лидского колледжа
            </span>
          </div>
        </div>

        {/* KPI 4: Ближайший дедлайн */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              Ближайший дедлайн
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">
              Завтра, 10:00
            </div>
            <span className="inline-block mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 truncate max-w-full">
              Основы ИБ • Тест 1.1: Термины и базовые понятия
            </span>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F3EF]">
              Предметы группы {primarySubject?.group || '37В'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-900/40">
              {subjectList.length} дисциплин
            </span>
          </div>
          {primarySubject && (
            <button 
              onClick={() => handleCardClick(primarySubject)}
              className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
            >
              <span>Открыть интерактивную карту</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {subjectList.map((subj) => {
            const meta = getSubjectMeta(subj.id);
            const Icon = meta.icon;
            const subjProgress = allProgress[subj.id] || (subj.id === securitySubject?.id ? progress : undefined);
            
            const subjTotalTopics = subj.topics.length;
            const subjCompletedTopics = subjProgress 
              ? subj.topics.filter(t => subjProgress.topicStatuses[t.id] === 'completed').length
              : 0;
            const subjPercent = subjTotalTopics > 0 
              ? Math.round((subjCompletedTopics / subjTotalTopics) * 100)
              : 0;

            return (
              <div 
                key={subj.id}
                onClick={() => handleCardClick(subj)}
                className="group relative p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] hover:border-[#2563EB] dark:hover:border-[#3B82F6] shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center font-bold`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.badgeBg}`}>
                      {meta.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F3F3EF] group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors line-clamp-2 leading-snug">
                      {subj.title}
                    </h3>
                    <span className="text-xs text-[#6B7280] dark:text-[#8E95A2] mt-1.5 block">
                      Преподаватель: <strong className="text-[#374151] dark:text-[#D1D5DB] font-medium">{subj.teacher}</strong>
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">
                      {subj.totalHours} ч ({subj.theoryHours} теор. / {subj.practiceHours} практ.)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-gray-500 text-[11px]">Прогресс</span>
                    <span className="text-[#2563EB] dark:text-[#60A5FA]">{subjPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-3">
                    <div 
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                      style={{ width: `${subjPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#8E95A2]">
                    <span>{subjTotalTopics} тем • {subj.practicalWorks.length} практ.</span>
                    <div className="flex items-center gap-1 font-semibold text-[#2563EB] dark:text-[#60A5FA] group-hover:translate-x-1 transition-transform">
                      <span>К карте</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Clean placeholder card for remaining subjects of group 37В */}
          {subjectList.length === 1 && (
            <div className="p-5 rounded-2xl border-2 border-dashed border-[#E5E7EB] dark:border-[#262A32] bg-white/50 dark:bg-[#15181E]/40 flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    Подключение
                  </span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                    Остальные дисциплины группы 37В
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#8E95A2] mt-1.5 leading-relaxed">
                    Будут добавлены вторым агентом по программе обучения Лидского колледжа (ПМС, ТЭСВТ, СТОИ и др.).
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[11px] text-[#6B7280] dark:text-[#8E95A2] flex items-center justify-between">
                <span>Текущий активный: Основы ИБ</span>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">В процессе</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Upcoming events & Motivation quote */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming events list */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Ближайшие события
            </h3>
            <button 
              onClick={onOpenSchedule}
              className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
            >
              Расписание →
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                date: '22 ноя',
                title: 'Тест 1.1: Термины и базовые понятия информационной безопасности',
                meta: 'Основы ИБ • 10:00 • 15 мин • Преп. Селедцов А.И.',
                subjectId: 'secbasics'
              },
              {
                date: '24 ноя',
                title: 'Тест 1.2: Концепция комплексной защиты информации',
                meta: 'Основы ИБ • 12:00 • 15 мин • Преп. Селедцов А.И.',
                subjectId: 'secbasics'
              },
              {
                date: '26 ноя',
                title: 'Практическая работа № 1: Определение нормативных требований ИБ',
                meta: 'Основы ИБ • 14:00 • Компьютерный класс 304',
                subjectId: 'secbasics'
              },
              {
                date: '29 ноя',
                title: 'Тест 2.1: Виды и формы представления информации',
                meta: 'Основы ИБ • 09:00 • 15 мин',
                subjectId: 'secbasics'
              }
            ].map((evt, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  const targetSubj = subjectList.find(s => s.id === evt.subjectId) || primarySubject;
                  if (targetSubj) handleCardClick(targetSubj);
                }}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#181B21] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-800 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-[#111827] dark:text-[#F3F3EF] shrink-0">
                    {evt.date}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                      {evt.title}
                    </span>
                    <span className="text-[11px] text-[#6B7280] dark:text-[#8E95A2]">
                      {evt.meta}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Motivation Quote Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#15181E] dark:to-[#181B21] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#2563EB] dark:text-[#60A5FA]">
              Фокус недели
            </span>
            <blockquote className="text-base sm:text-lg font-medium text-[#111827] dark:text-[#F3F3EF] leading-relaxed italic">
              «Маленькие шаги каждый день приводят к большим результатам.»
            </blockquote>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200/70 dark:border-gray-800 text-xs text-[#6B7280] dark:text-[#8E95A2]">
            <span>Study OS • Колледж</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
