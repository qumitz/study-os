import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Layers
} from 'lucide-react';
import { ScheduleItem, User, Subject } from '../types';

interface ScheduleViewProps {
  currentUser?: User;
  allSubjects?: Subject[];
}

const DEFAULT_COLLEGE_SUBJECTS = [
  'Технические средства информатизации',
  'Основы информационной безопасности',
  'Программирование микропроцессорных систем',
  'Техническая эксплуатация средств ВТ',
  'Сетевые технологии обработки информации',
  'Технологии передачи информации',
  'Разработка мобильных приложений',
  'Системы автоматизированного проектирования'
];

const TIME_SLOTS = [
  { label: '1 пара (08:30 — 10:00)', value: '08:30 - 10:00' },
  { label: '2 пара (10:15 — 11:45)', value: '10:15 - 11:45' },
  { label: '3 пара (12:00 — 13:30)', value: '12:00 - 13:30' },
  { label: '4 пара (14:00 — 15:30)', value: '14:00 - 15:30' },
  { label: '5 пара (15:45 — 17:15)', value: '15:45 - 17:15' }
];

const LESSON_TYPES = [
  'Лекция',
  'Практическое занятие',
  'Лабораторная работа',
  'Контрольная работа / ОКР',
  'Консультация',
  'Зачёт / Экзамен'
];

const COLOR_THEMES = [
  { id: 'blue', label: 'Синий', border: 'border-l-blue-500', bg: 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
  { id: 'indigo', label: 'Индиго', border: 'border-l-indigo-600', bg: 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300' },
  { id: 'emerald', label: 'Изумрудный', border: 'border-l-emerald-500', bg: 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
  { id: 'cyan', label: 'Циановый', border: 'border-l-cyan-500', bg: 'bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300' },
  { id: 'amber', label: 'Янтарный', border: 'border-l-amber-500', bg: 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  { id: 'rose', label: 'Розовый', border: 'border-l-rose-500', bg: 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' },
  { id: 'purple', label: 'Фиолетовый', border: 'border-l-purple-500', bg: 'bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' }
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({ currentUser, allSubjects }) => {
  const [view, setView] = useState<'week' | 'month'>('week');

  const collegeSubjects = useMemo(() => {
    if (allSubjects && allSubjects.length > 0) {
      return allSubjects.map(s => s.title);
    }
    return DEFAULT_COLLEGE_SUBJECTS;
  }, [allSubjects]);

  // Can the current user edit the schedule? (Teacher or Admin)
  const canEdit = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Schedule items state stored in localStorage; empty by default as requested
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('study_os_schedule_items');
      if (saved) {
        const parsed: ScheduleItem[] = JSON.parse(saved);
        // Clean out and fix any legacy "Теория электрической связи" -> "Технические средства информатизации"
        return parsed.map(item => {
          if (item.title === 'Теория электрической связи' || item.title.includes('электрической связи')) {
            return { ...item, title: 'Технические средства информатизации' };
          }
          return item;
        });
      }
      return [];
    } catch (e) {
      console.error('Failed to load schedule items', e);
      return [];
    }
  });

  // Save to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('study_os_schedule_items', JSON.stringify(scheduleItems));
  }, [scheduleItems]);

  // Modal dialog state for adding / editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form fields
  const [formDayIndex, setFormDayIndex] = useState<number>(0);
  const [formTitle, setFormTitle] = useState<string>(DEFAULT_COLLEGE_SUBJECTS[0]);
  const [formType, setFormType] = useState<string>('Лекция');
  const [formTime, setFormTime] = useState<string>('08:30 - 10:00');
  const [formRoom, setFormRoom] = useState<string>('Ауд. 312');
  const [formTeacher, setFormTeacher] = useState<string>('Селедцов Александр Игоревич');
  const [formColorId, setFormColorId] = useState<string>('blue');
  const [formNotes, setFormNotes] = useState<string>('');

  // Real calendar week state (defaults to today)
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(() => new Date());

  // Mobile selected day index (0 = Monday, ..., 6 = Sunday)
  const [mobileSelectedDay, setMobileSelectedDay] = useState<number>(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  });

  // Helper to get Monday of the selected week
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const monday = getMonday(currentWeekDate);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    dayDate.setHours(0, 0, 0, 0);
    const isToday = dayDate.getTime() === today.getTime();
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const fullDayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

    return {
      day: dayNames[i],
      fullDay: fullDayNames[i],
      date: dayDate.getDate().toString(),
      monthShort: dayDate.toLocaleDateString('ru-RU', { month: 'short' }),
      dateStr: dayDate.toISOString().split('T')[0],
      isToday
    };
  });

  const weekRangeText = `${monday.getDate()} ${monday.toLocaleDateString('ru-RU', { month: 'short' })} — ${sunday.getDate()} ${sunday.toLocaleDateString('ru-RU', { month: 'short' })} ${sunday.getFullYear()}`;

  const handlePrevWeek = () => {
    setCurrentWeekDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleTodayWeek = () => {
    setCurrentWeekDate(new Date());
  };

  const handleOpenAddModal = (dayIndex = 0) => {
    setEditingItemId(null);
    setFormDayIndex(dayIndex);
    setFormTitle(collegeSubjects[0] || DEFAULT_COLLEGE_SUBJECTS[0]);
    setFormType('Лекция');
    setFormTime('08:30 - 10:00');
    setFormRoom('Ауд. 312');
    setFormTeacher('Селедцов Александр Игоревич');
    setFormColorId('blue');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ScheduleItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingItemId(item.id);
    setFormDayIndex(item.dayIndex);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormTime(item.time);
    setFormRoom(item.room);
    setFormTeacher(item.teacher || 'Селедцов Александр Игоревич');
    const matchedColor = COLOR_THEMES.find(c => item.color?.includes(c.border))?.id || 'blue';
    setFormColorId(matchedColor);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const theme = COLOR_THEMES.find(c => c.id === formColorId) || COLOR_THEMES[0];
    const colorClass = `${theme.border} ${theme.bg}`;

    if (editingItemId) {
      // Update existing item
      setScheduleItems(prev => prev.map(item => {
        if (item.id === editingItemId) {
          return {
            ...item,
            dayIndex: formDayIndex,
            title: formTitle.trim(),
            type: formType,
            time: formTime,
            room: formRoom.trim(),
            teacher: formTeacher.trim(),
            color: colorClass,
            notes: formNotes.trim()
          };
        }
        return item;
      }));
    } else {
      // Add new item
      const newItem: ScheduleItem = {
        id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        dayIndex: formDayIndex,
        title: formTitle.trim(),
        type: formType,
        time: formTime,
        room: formRoom.trim(),
        teacher: formTeacher.trim(),
        color: colorClass,
        notes: formNotes.trim()
      };
      setScheduleItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Удалить эту пару из расписания?')) {
      setScheduleItems(prev => prev.filter(item => item.id !== id));
      if (editingItemId === id) {
        setIsModalOpen(false);
      }
    }
  };

  const handleClearAllSchedule = () => {
    if (window.confirm('Вы уверены, что хотите полностью очистить всё расписание занятий?')) {
      setScheduleItems([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Schedule Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">
              Расписание занятий
            </h1>
            {canEdit && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60">
                Режим редактирования
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#8E95A2] mt-0.5">
            Лидский колледж УО «ГрГУ им. Янки Купалы» • Группа 37В • I полугодие 2026/2027
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action Button for Teacher / Admin */}
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenAddModal(0)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить пару</span>
              </button>
              {scheduleItems.length > 0 && (
                <button
                  onClick={handleClearAllSchedule}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Очистить всё расписание"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* View Segmented Control */}
          <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-xs font-semibold">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                view === 'week'
                  ? 'bg-white dark:bg-[#252A34] text-[#111827] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                view === 'month'
                  ? 'bg-white dark:bg-[#252A34] text-[#111827] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Месяц
            </button>
          </div>

          {/* Week Pagination */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 text-xs font-medium">
            <button 
              onClick={handlePrevWeek}
              title="Предыдущая неделя"
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-[#111827] dark:text-[#F3F3EF]">
              {weekRangeText}
            </span>
            <button 
              onClick={handleNextWeek}
              title="Следующая неделя"
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            type="button"
            onClick={handleTodayWeek}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15181E] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-xs"
          >
            Текущая неделя
          </button>
        </div>
      </div>

      {/* Empty State Banner (if schedule is empty) */}
      {scheduleItems.length === 0 && (
        <div className="p-5 sm:p-6 rounded-2xl border border-dashed border-gray-300 dark:border-[#2E333D] bg-white/60 dark:bg-[#15181E]/60 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Расписание занятий пока не заполнено
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
              {canEdit 
                ? 'Как преподаватель или администратор, вы можете добавить пары на любой день недели, нажав кнопку «+ Добавить пару».'
                : 'Преподаватель или администратор скоро добавят актуальные пары на эту неделю.'}
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => handleOpenAddModal(0)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить первое занятие</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Day-by-Day View (< md screens) */}
      <div className="block md:hidden space-y-4">
        {/* Horizontal Days Selector Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5">
          {days.map((d, idx) => {
            const isSelected = mobileSelectedDay === idx;
            const dayClassCount = scheduleItems.filter(item => item.dayIndex === idx).length;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setMobileSelectedDay(idx)}
                className={`flex-1 min-w-[44px] py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : d.isToday
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                    : 'bg-white dark:bg-[#15181E] border border-gray-200 dark:border-[#262A32] text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                  {d.day}
                </span>
                <span className="text-sm font-bold mt-0.5">
                  {d.date}
                </span>
                {dayClassCount > 0 && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-600 dark:bg-blue-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
              {days[mobileSelectedDay]?.fullDay}, {days[mobileSelectedDay]?.date} {days[mobileSelectedDay]?.monthShort}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {(() => {
                const count = scheduleItems.filter(i => i.dayIndex === mobileSelectedDay).length;
                if (count === 0) return 'Занятий нет';
                if (count === 1) return '1 пара';
                if (count >= 2 && count <= 4) return `${count} пары`;
                return `${count} пар`;
              })()}
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => handleOpenAddModal(mobileSelectedDay)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Пара</span>
            </button>
          )}
        </div>

        {/* Mobile Classes List */}
        <div className="space-y-2.5">
          {(() => {
            const dayClasses = scheduleItems
              .filter(item => item.dayIndex === mobileSelectedDay)
              .sort((a, b) => a.time.localeCompare(b.time));

            if (dayClasses.length === 0) {
              return (
                <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-[#262A32] bg-white/50 dark:bg-[#15181E]/50 text-center space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    На этот день занятия не запланированы
                  </p>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenAddModal(mobileSelectedDay)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Назначить пару на этот день</span>
                    </button>
                  )}
                </div>
              );
            }

            return dayClasses.map(cls => (
              <div
                key={cls.id}
                onClick={() => canEdit && handleOpenEditModal(cls)}
                className={`p-3.5 rounded-2xl border-l-4 border shadow-xs transition-all ${
                  canEdit ? 'active:scale-[0.99] cursor-pointer' : ''
                } ${cls.color || 'border-l-blue-500 bg-blue-50/60 dark:bg-blue-950/30'} border-gray-200/70 dark:border-[#262A32] bg-white dark:bg-[#15181E]`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {cls.type}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {cls.time}
                    </span>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenEditModal(cls, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Редактировать"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(cls.id, e)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] leading-snug mt-1.5">
                  {cls.title}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{cls.room}</span>
                  </div>
                  {cls.teacher && (
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[200px]">{cls.teacher}</span>
                    </div>
                  )}
                </div>

                {cls.notes && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 italic mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                    {cls.notes}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Timetable Grid (Desktop >= md screens) */}
      <div className="hidden md:block rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] overflow-x-auto shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 min-w-[840px] border-b border-[#E5E7EB] dark:border-[#262A32]">
          {days.map((d, idx) => (
            <div
              key={idx}
              className={`p-3 text-center border-r last:border-r-0 border-[#E5E7EB] dark:border-[#262A32] ${
                d.isToday ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                  {d.day}
                </span>
                {canEdit && (
                  <button
                    onClick={() => handleOpenAddModal(idx)}
                    title={`Добавить пару на ${d.fullDay}`}
                    className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className={`text-sm font-bold mt-1 inline-flex w-7 h-7 items-center justify-center rounded-full ${
                d.isToday 
                  ? 'bg-[#2563EB] text-white shadow-xs' 
                  : 'text-[#111827] dark:text-[#F3F3EF]'
              }`}>
                {d.date}
              </div>
            </div>
          ))}
        </div>

        {/* Days Columns Body */}
        <div className="grid grid-cols-7 min-w-[840px] min-h-[440px] divide-x divide-[#E5E7EB] dark:divide-[#262A32]">
          {days.map((d, dayIndex) => {
            const dayClasses = scheduleItems
              .filter(item => item.dayIndex === dayIndex)
              .sort((a, b) => a.time.localeCompare(b.time));

            return (
              <div key={dayIndex} className="p-2 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  {dayClasses.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => canEdit && handleOpenEditModal(cls)}
                      className={`group relative p-3 rounded-xl border-l-4 border shadow-xs transition-all ${
                        canEdit ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
                      } ${cls.color || 'border-l-blue-500 bg-blue-50/60 dark:bg-blue-950/30'} border-gray-200/70 dark:border-gray-800`}
                    >
                      {/* Top Header of Class Card */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block truncate">
                          {cls.type}
                        </span>
                        {canEdit && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={(e) => handleOpenEditModal(cls, e)}
                              className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-white/80 dark:hover:bg-gray-800"
                              title="Редактировать пару"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteItem(cls.id, e)}
                              className="p-1 rounded text-gray-500 hover:text-rose-600 hover:bg-white/80 dark:hover:bg-gray-800"
                              title="Удалить пару"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Subject Title */}
                      <h4 className="text-xs font-bold text-[#111827] dark:text-[#F3F3EF] leading-snug mt-1 line-clamp-2">
                        {cls.title}
                      </h4>

                      {/* Time */}
                      <div className="flex items-center gap-1 text-[10px] font-medium text-gray-600 dark:text-gray-300 mt-2">
                        <Clock className="w-3 h-3 shrink-0 text-gray-400" />
                        <span>{cls.time}</span>
                      </div>

                      {/* Room & Teacher */}
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                        <span className="truncate">{cls.room}</span>
                      </div>

                      {cls.teacher && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          <UserIcon className="w-3 h-3 shrink-0 text-gray-400" />
                          <span className="truncate">{cls.teacher}</span>
                        </div>
                      )}

                      {cls.notes && (
                        <div className="text-[10px] italic text-gray-500 dark:text-gray-400 mt-1.5 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
                          {cls.notes}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty Day Indicator */}
                  {dayClasses.length === 0 && (
                    <div className="py-8 text-center text-gray-300 dark:text-gray-700">
                      <span className="text-[11px] block">— нет пар —</span>
                    </div>
                  )}
                </div>

                {/* Inline Add Button on bottom of column for teachers */}
                {canEdit && (
                  <button
                    onClick={() => handleOpenAddModal(dayIndex)}
                    className="w-full py-1.5 px-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 text-[11px] font-medium text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Dialog for Adding / Editing Lesson */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                    {editingItemId ? 'Редактировать занятие' : 'Добавить занятие в расписание'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Группа 37В • Лидский колледж
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E232B] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Day of Week */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  День недели
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormDayIndex(idx)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formDayIndex === idx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-[#1A1E24] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Дисциплина (Предмет)
                </label>
                <select
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {collegeSubjects.map((subj: string, idx: number) => (
                    <option key={idx} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
                <div className="mt-1.5">
                  <input
                    type="text"
                    placeholder="Либо введите своё название предмета..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Type and Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Тип занятия
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LESSON_TYPES.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time slot */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Время пары
                  </label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TIME_SLOTS.map((slot, idx) => (
                      <option key={idx} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room and Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Аудитория
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Ауд. 312"
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Преподаватель
                  </label>
                  <input
                    type="text"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    placeholder="Селедцов Александр Игоревич"
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Color Theme Accent */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Цветовой акцент карточки
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_THEMES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormColorId(c.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        formColorId === c.id
                          ? 'border-blue-500 ring-2 ring-blue-500/20 font-bold'
                          : 'border-gray-200 dark:border-gray-800 opacity-80 hover:opacity-100'
                      } ${c.bg}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.border.replace('border-l-', 'bg-')}`}></span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Примечание / Подгруппа (опционально)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Например: 1-я подгруппа, сдать отчёт"
                  className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1E24] text-base sm:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                {editingItemId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(editingItemId)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Удалить пару</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingItemId ? 'Сохранить изменения' : 'Добавить пару'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
