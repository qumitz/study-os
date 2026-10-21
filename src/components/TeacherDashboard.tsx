import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  RotateCcw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Check, 
  TrendingUp,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { StudentGradeRecord, Subject } from '../types';
import { initialGroup37vStudents } from '../data/mockData';

interface TeacherDashboardProps {
  subject: Subject;
  currentUserGroup: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  subject,
  currentUserGroup
}) => {
  const [students, setStudents] = useState<StudentGradeRecord[]>(() => {
    const saved = localStorage.getItem('study_os_teacher_grades_37v');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialGroup37vStudents;
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedStudentForReset, setSelectedStudentForReset] = useState<{ student: StudentGradeRecord; topicCode: string; topicId: string } | null>(null);

  // Key topics to display in gradebook matrix columns
  const trackedTopics = [
    { id: 'top-intro', code: 'Введение' },
    { id: 'top-1-1', code: '1.1' },
    { id: 'top-1-2', code: '1.2' },
    { id: 'top-2-1', code: '2.1' },
    { id: 'top-2-2', code: '2.2' },
    { id: 'top-3-1', code: '3.1' },
    { id: 'top-3-2', code: '3.2' },
    { id: 'top-4-1', code: '4.1' },
  ];

  // Calculate summary stats
  const totalStudents = students.length;
  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(searchFilter.toLowerCase())
  );
  
  const avgGroupScore = (
    students.reduce((acc, curr) => acc + curr.averageScore, 0) / totalStudents
  ).toFixed(1);

  const debtorsCount = students.filter(s => s.averageScore < 4 || s.topicGrades['top-intro'] === null).length;

  const handleResetAttempt = () => {
    if (!selectedStudentForReset) return;
    const { student, topicId } = selectedStudentForReset;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.studentId === student.studentId) {
          const newGrades = { ...s.topicGrades, [topicId]: null };
          // Recalculate average
          const validScores = Object.values(newGrades).filter((v): v is number => v !== null);
          const newAvg = validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
          return {
            ...s,
            topicGrades: newGrades,
            averageScore: Math.round(newAvg * 10) / 10
          };
        }
        return s;
      });

      localStorage.setItem('study_os_teacher_grades_37v', JSON.stringify(updated));
      return updated;
    });

    setSelectedStudentForReset(null);
  };

  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-400 dark:bg-gray-800/60 dark:text-gray-500';
    if (score >= 9) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
    if (score >= 6) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold';
    if (score >= 4) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold';
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Teacher Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">
                Кабинет преподавателя
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Группа {currentUserGroup}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8E95A2] mt-0.5">
              Преподаватель: <strong className="text-gray-900 dark:text-gray-200">{subject.teacher}</strong> • Дисциплина: {subject.title}
            </p>
          </div>
        </div>

        {/* Quick export button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Ведомость группы 37В успешно сформирована в формате Excel/CSV!')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Экспорт ведомости</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for the Teacher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Студентов в группе 37В
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
            {totalStudents} <span className="text-sm font-normal text-gray-400">человек</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium block">
            100% зарегистрированы в системе
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Средний балл группы
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
            {avgGroupScore} <span className="text-sm font-normal text-gray-400">/ 10</span>
          </div>
          <span className="text-[11px] text-[#2563EB] font-medium block">
            Качественная успеваемость: 85%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Требуют внимания (задолженности)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {debtorsCount} <span className="text-sm font-normal text-gray-400">студент</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium block">
            Низкий балл или пропущенные тесты
          </span>
        </div>
      </div>

      {/* Gradebook Matrix Table Card */}
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] shadow-sm overflow-hidden space-y-4 p-5">
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Электронный журнал успеваемости группы 37В
            </h3>
            <span className="text-xs text-gray-400">
              (10-балльная шкала РБ)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Поиск студента..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-[#6B7280] dark:text-[#9CA3AF] bg-gray-50/50 dark:bg-[#181B21]">
                <th className="py-3 px-4 font-semibold">Студент</th>
                {trackedTopics.map(t => (
                  <th key={t.id} className="py-3 px-2 text-center font-semibold">
                    {t.code}
                  </th>
                ))}
                <th className="py-3 px-3 text-center font-semibold">Ср. балл</th>
                <th className="py-3 px-3 text-right font-semibold">Управление</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
              {filteredStudents.map(student => (
                <tr key={student.studentId} className="hover:bg-gray-50/80 dark:hover:bg-[#1A1E24] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#111827] dark:text-[#F3F3EF] whitespace-nowrap">
                    {student.studentName}
                  </td>

                  {trackedTopics.map(t => {
                    const score = student.topicGrades[t.id];
                    return (
                      <td key={t.id} className="py-2 px-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (score !== null) {
                              setSelectedStudentForReset({
                                student,
                                topicCode: t.code,
                                topicId: t.id
                              });
                            }
                          }}
                          title={score !== null ? 'Нажмите, чтобы сбросить попытку' : 'Тест еще не сдан'}
                          className={`inline-block min-w-7 py-1 px-1.5 rounded-lg text-xs font-mono transition-transform hover:scale-110 ${getScoreBadgeClass(score)}`}
                        >
                          {score !== null ? score : '—'}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="font-bold font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[#111827] dark:text-[#F3F3EF]">
                      {student.averageScore}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        // Reset last submitted topic for this student
                        const lastTopic = trackedTopics.find(t => student.topicGrades[t.id] !== null) || trackedTopics[0];
                        setSelectedStudentForReset({
                          student,
                          topicCode: lastTopic.code,
                          topicId: lastTopic.id
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Сбросить тест</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Attempt Confirmation Modal */}
      {selectedStudentForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Сбросить попытку теста?
                </h4>
                <span className="text-xs text-gray-500">
                  Тема {selectedStudentForReset.topicCode}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Вы уверены, что хотите сбросить оценку студенту <strong className="text-gray-900 dark:text-gray-200">{selectedStudentForReset.student.studentName}</strong>? Студент получит возможность пройти тест заново с одной попыткой.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedStudentForReset(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Отмена
              </button>
              <button
                onClick={handleResetAttempt}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Да, сбросить попытку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
