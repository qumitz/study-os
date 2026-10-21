import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const [view, setView] = useState<'week' | 'month'>('week');

  const days = [
    { day: 'Пн', date: '11', isToday: false },
    { day: 'Вт', date: '12', isToday: true },
    { day: 'Ср', date: '13', isToday: false },
    { day: 'Чт', date: '14', isToday: false },
    { day: 'Пт', date: '15', isToday: false },
    { day: 'Сб', date: '16', isToday: false },
    { day: 'Вс', date: '17', isToday: false },
  ];

  const scheduleItems = [
    {
      dayIndex: 0, // Пн
      title: 'Математика',
      type: 'Лекция',
      time: '08:30 - 10:00',
      room: 'Ауд. 204',
      teacher: 'Ковалева И.В.',
      color: 'border-l-blue-500 bg-blue-50/60 dark:bg-blue-950/30'
    },
    {
      dayIndex: 0, // Пн
      title: 'Основы информационной безопасности',
      type: 'Лекция • Триада КЦД',
      time: '10:15 - 11:45',
      room: 'Ауд. 312 (Комп. класс)',
      teacher: 'Селедцов А.И.',
      color: 'border-l-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40'
    },
    {
      dayIndex: 1, // Вт
      title: 'Основы ИБ: Практическая работа № 1',
      type: 'Практикум • Нормативная база РБ',
      time: '12:00 - 13:30',
      room: 'Ауд. 312',
      teacher: 'Селедцов А.И.',
      color: 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
    },
    {
      dayIndex: 2, // Ср
      title: 'Физика',
      type: 'Лекция',
      time: '12:00 - 13:30',
      room: 'Ауд. 108',
      teacher: 'Смирнов В.П.',
      color: 'border-l-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/30'
    },
    {
      dayIndex: 3, // Чт
      title: 'Дискретная математика',
      type: 'Практика',
      time: '14:00 - 15:30',
      room: 'Ауд. 215',
      teacher: 'Петрова Е.Н.',
      color: 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/30'
    },
    {
      dayIndex: 4, // Пт
      title: 'Основы ИБ: Тестирование по Разделу I',
      type: 'Тест • 1 попытка',
      time: '10:15 - 11:45',
      room: 'Ауд. 312',
      teacher: 'Селедцов А.И.',
      color: 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/30'
    }
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Schedule Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">
            Расписание занятий
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
            Лидский колледж • Группа 37В • I полугодие 2026/2027
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Segmented Control */}
          <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-xs font-semibold">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                view === 'week'
                  ? 'bg-white dark:bg-[#252A34] text-[#111827] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold text-[#111827] dark:text-[#F3F3EF]">
              11 — 17 ноября 2026
            </span>
            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15181E] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50">
            Сегодня
          </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] overflow-x-auto shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 min-w-[700px] border-b border-[#E5E7EB] dark:border-[#262A32]">
          {days.map((d, idx) => (
            <div
              key={idx}
              className={`p-3 text-center border-r last:border-r-0 border-[#E5E7EB] dark:border-[#262A32] ${
                d.isToday ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                {d.day}
              </div>
              <div className={`text-base font-bold mt-0.5 inline-flex w-7 h-7 items-center justify-center rounded-full ${
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
        <div className="grid grid-cols-7 min-w-[700px] min-h-[460px] divide-x divide-[#E5E7EB] dark:divide-[#262A32]">
          {days.map((d, dayIndex) => {
            const dayClasses = scheduleItems.filter(item => item.dayIndex === dayIndex);

            return (
              <div key={dayIndex} className="p-2 space-y-2">
                {dayClasses.map((cls, cIdx) => (
                  <div
                    key={cIdx}
                    className={`p-2.5 rounded-xl border-l-4 border shadow-xs transition-all hover:scale-[1.02] cursor-pointer ${cls.color} border-gray-200/60 dark:border-gray-800`}
                  >
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      {cls.type}
                    </span>
                    <h4 className="text-xs font-bold text-[#111827] dark:text-[#F3F3EF] leading-snug mt-1">
                      {cls.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>{cls.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{cls.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
