import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  Award, 
  RotateCcw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  FileSpreadsheet,
  Database,
  X,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FlaskConical,
  HelpCircle,
  FileText,
  Layers,
  Save,
  ExternalLink
} from 'lucide-react';
import { StudentGradeRecord, Subject, Topic, PracticalWork } from '../types';
import { isSupabaseConfigured, fetchGroupStudentsFromDb } from '../lib/supabase';
import { getRegisteredStudentsForGroup, saveGroupStudents, mergeStudentRecords } from '../lib/studentRegistry';
import { getAvailableGroups } from '../lib/groupRegistry';

export interface TeacherDashboardProps {
  subject: Subject;
  currentUserGroup: string;
  allSubjects?: Subject[];
  onSelectSubject?: (subjectOrId: string | Subject) => void;
}

// Friendly titles for all 8 curriculum disciplines
export const getSubjectFriendlyName = (s: Subject): string => {
  const map: Record<string, string> = {
    secbasics: 'Основы ИБ',
    pms: 'Микропроцессоры',
    tesvt: 'Техн. эксплуатация',
    network: 'Сетевые технологии',
    stoi: 'Сетевые технологии',
    transmission: 'Системы передачи',
    pspi: 'Системы передачи',
    mobile: 'Мобильная разработка',
    rmp: 'Мобильная разработка',
    cad: 'САПР',
    sapr: 'САПР',
    tsi: 'Техн. средства информ.'
  };
  return map[s.id] || s.shortTitle || s.code || s.title;
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  subject,
  currentUserGroup,
  allSubjects = [],
  onSelectSubject
}) => {
  // Use allSubjects list or fallback to current subject
  const subjectsList = useMemo(() => {
    return allSubjects.length > 0 ? allSubjects : [subject];
  }, [allSubjects, subject]);

  // Active subject in the main journal matrix
  const [activeSubjectId, setActiveSubjectId] = useState<string>(subject.id);
  const activeSubject = useMemo(() => {
    return subjectsList.find(s => s.id === activeSubjectId) || subject;
  }, [subjectsList, activeSubjectId, subject]);

  const availableGroups = getAvailableGroups();
  const [activeGroup, setActiveGroup] = useState<string>(currentUserGroup || '37В');

  useEffect(() => {
    if (currentUserGroup) {
      setActiveGroup(currentUserGroup);
    }
  }, [currentUserGroup]);

  // Load registered students for this group (automatically populated when students register)
  const [students, setStudents] = useState<StudentGradeRecord[]>(() => {
    return getRegisteredStudentsForGroup(currentUserGroup || '37В');
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [isLiveFromDb, setIsLiveFromDb] = useState<boolean>(false);

  // Selected student for deep detailed inspection & grading modal
  const [selectedStudent, setSelectedStudent] = useState<StudentGradeRecord | null>(null);
  // Subject selected inside the student details modal
  const [modalSubjectId, setModalSubjectId] = useState<string>(subject.id);
  // Reset confirmation state
  const [selectedStudentForReset, setSelectedStudentForReset] = useState<{ 
    student: StudentGradeRecord; 
    topicCode: string; 
    workId: string; 
    subjectId: string 
  } | null>(null);

  // Reload students when group changes
  useEffect(() => {
    setStudents(getRegisteredStudentsForGroup(activeGroup));
  }, [activeGroup]);

  // Sync students from Supabase if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchGroupStudentsFromDb(activeGroup, activeSubject.id).then((dbStudents) => {
        if (dbStudents !== null) {
          const local = getRegisteredStudentsForGroup(activeGroup);
          const merged = mergeStudentRecords(local, dbStudents);
          setStudents(merged);
          setIsLiveFromDb(true);
          saveGroupStudents(activeGroup, merged);
        }
      });
    }
  }, [activeGroup, activeSubject.id]);

  // Helper: get student grades map for any subject
  const getStudentGradesForSubject = (student: StudentGradeRecord, subjId: string): Record<string, number | null> => {
    if (student.subjectGrades && student.subjectGrades[subjId]) {
      return student.subjectGrades[subjId];
    }
    // Backward compatibility: secbasics uses student.topicGrades
    if (subjId === 'secbasics' && student.topicGrades) {
      return student.topicGrades;
    }
    return {};
  };

  // Helper: calculate average score for a student in a specific subject
  const calculateSubjectAverage = (gradesMap: Record<string, number | null>): number => {
    const validScores = Object.values(gradesMap).filter((v): v is number => typeof v === 'number' && v > 0);
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / validScores.length) * 10) / 10;
  };

  // Helper: get student average for a subject (cached or computed)
  const getSubjectAverage = (student: StudentGradeRecord, subjId: string): number => {
    if (student.subjectAverages && typeof student.subjectAverages[subjId] === 'number') {
      return student.subjectAverages[subjId];
    }
    const grades = getStudentGradesForSubject(student, subjId);
    return calculateSubjectAverage(grades);
  };

  // Helper: calculate overall GPA for a student across all subjects
  const getOverallGPA = (student: StudentGradeRecord): number => {
    const averages: number[] = [];
    subjectsList.forEach(s => {
      const avg = getSubjectAverage(student, s.id);
      if (avg > 0) averages.push(avg);
    });
    if (averages.length === 0) return student.averageScore || 0;
    const sum = averages.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / averages.length) * 10) / 10;
  };

  // Set or update a student's grade for a specific work item in a subject
  const handleSetGrade = (studentId: string, subjId: string, workId: string, score: number | null) => {
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(st => {
        if (st.studentId !== studentId) return st;

        const currentSubjectGrades = { ...getStudentGradesForSubject(st, subjId) };
        if (score === null) {
          delete currentSubjectGrades[workId];
        } else {
          currentSubjectGrades[workId] = score;
        }

        const newSubjectAvg = calculateSubjectAverage(currentSubjectGrades);
        const updatedSubjectAverages = {
          ...(st.subjectAverages || {}),
          [subjId]: newSubjectAvg
        };

        const updatedSubjectGrades = {
          ...(st.subjectGrades || {}),
          [subjId]: currentSubjectGrades
        };

        // If secbasics, keep topicGrades synced
        const updatedTopicGrades = subjId === 'secbasics'
          ? { ...st.topicGrades, [workId]: score }
          : st.topicGrades;

        // Recalculate overall average across non-zero subjects
        const validAvgs = Object.values(updatedSubjectAverages).filter(v => v > 0);
        const newOverallAvg = validAvgs.length > 0
          ? Math.round((validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length) * 10) / 10
          : newSubjectAvg || st.averageScore;

        const updatedStudent: StudentGradeRecord = {
          ...st,
          topicGrades: updatedTopicGrades,
          subjectGrades: updatedSubjectGrades,
          subjectAverages: updatedSubjectAverages,
          averageScore: newOverallAvg
        };

        if (selectedStudent?.studentId === studentId) {
          setSelectedStudent(updatedStudent);
        }

        return updatedStudent;
      });

      saveGroupStudents(currentUserGroup, updatedStudents);
      return updatedStudents;
    });
  };

  // Save teacher note for student & subject
  const handleSaveTeacherNote = (studentId: string, subjId: string, note: string) => {
    setStudents(prev => {
      const updated = prev.map(st => {
        if (st.studentId !== studentId) return st;
        const updatedNotes = { ...(st.teacherNotes || {}), [subjId]: note };
        const updatedStudent = { ...st, teacherNotes: updatedNotes };
        if (selectedStudent?.studentId === studentId) {
          setSelectedStudent(updatedStudent);
        }
        return updatedStudent;
      });
      saveGroupStudents(currentUserGroup, updated);
      return updated;
    });
  };

  // Reset attempt handler
  const handleConfirmResetAttempt = () => {
    if (!selectedStudentForReset) return;
    const { student, workId, subjectId } = selectedStudentForReset;
    handleSetGrade(student.studentId, subjectId, workId, null);
    setSelectedStudentForReset(null);
  };

  // Key topics to display in table matrix columns for the active subject
  const trackedTopicsForActiveSubject = useMemo(() => {
    if (!activeSubject.topics || activeSubject.topics.length === 0) return [];
    return activeSubject.topics.slice(0, 8).map(t => ({
      id: t.id,
      code: t.code,
      title: t.title,
      isExam: t.isExam
    }));
  }, [activeSubject]);

  // Summary statistics for the active subject
  const totalStudents = students.length;
  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const activeSubjectAvgGroup = useMemo(() => {
    if (totalStudents === 0) return '—';
    const studentsWithGrades = students.filter(s => getSubjectAverage(s, activeSubject.id) > 0);
    if (studentsWithGrades.length === 0) return '—';
    const sum = studentsWithGrades.reduce((acc, curr) => acc + getSubjectAverage(curr, activeSubject.id), 0);
    return (sum / studentsWithGrades.length).toFixed(1);
  }, [students, activeSubject.id, totalStudents]);

  const activeSubjectDebtors = useMemo(() => {
    return students.filter(s => {
      const avg = getSubjectAverage(s, activeSubject.id);
      return avg < 4 && avg > 0;
    }).length;
  }, [students, activeSubject.id]);

  const getScoreBadgeClass = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-400 dark:bg-gray-800/60 dark:text-gray-500';
    if (score >= 9) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
    if (score >= 6) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold';
    if (score >= 4) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold';
  };

  // Modal active subject object
  const modalSubject = useMemo(() => {
    return subjectsList.find(s => s.id === modalSubjectId) || activeSubject;
  }, [subjectsList, modalSubjectId, activeSubject]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Teacher Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">
                Журнал успеваемости преподавателя
              </h1>
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Группа:</span>
                <select
                  value={activeGroup}
                  onChange={(e) => setActiveGroup(e.target.value)}
                  className="bg-transparent text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none cursor-pointer"
                >
                  {availableGroups.map((g) => (
                    <option key={g.id} value={g.name} className="bg-white dark:bg-[#15181E] text-gray-900 dark:text-white">
                      {g.name} ({g.course} курс)
                    </option>
                  ))}
                </select>
              </div>
              {isLiveFromDb && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Supabase Live
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8E95A2] mt-0.5">
              Преподаватель: <strong className="text-gray-900 dark:text-gray-200">{activeSubject.teacher}</strong> • Дисциплина: <strong className="text-indigo-600 dark:text-indigo-400">{activeSubject.title}</strong>
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onSelectSubject && (
            <button
              onClick={() => onSelectSubject(activeSubject)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Открыть темы предмета</span>
            </button>
          )}

          <button
            onClick={() => alert(`Ведомость группы ${currentUserGroup} по предмету "${activeSubject.title}" успешно сформирована в формате Excel/CSV!`)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Экспорт ведомости</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Выберите предмет для отображения в журнале:
          </span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hidden sm:inline">
            Всего 8 дисциплин колледжа
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {subjectsList.map((s) => {
            const isSelected = s.id === activeSubjectId;
            const friendlyName = getSubjectFriendlyName(s);
            return (
              <button
                key={s.id}
                onClick={() => setActiveSubjectId(s.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-[#1A1E24] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <span>{friendlyName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {s.topics?.length || 0} тем
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards for the Teacher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Студентов в группе {currentUserGroup}
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
            Средний балл по «{getSubjectFriendlyName(activeSubject)}»
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F3EF]">
            {activeSubjectAvgGroup} <span className="text-sm font-normal text-gray-400">/ 10</span>
          </div>
          <span className="text-[11px] text-[#2563EB] font-medium block">
            Успеваемость по дисциплине
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
            Задолженности по предмету
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {activeSubjectDebtors} <span className="text-sm font-normal text-gray-400">студент(ов)</span>
          </div>
          <span className="text-[11px] text-gray-400 font-medium block">
            Балл ниже 4 или пропущенные тесты
          </span>
        </div>
      </div>

      {/* Gradebook Matrix Table Card */}
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] shadow-sm overflow-hidden space-y-4 p-5">
        {/* Table Top Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Ведомость оценок: {activeSubject.title}
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              (нажмите на строку студента для индивидуальной карточки)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Поиск по фамилии..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Matrix Table or Empty States */}
        {students.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h4 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                В группе {currentUserGroup} пока нет зарегистрированных учащихся
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Студенты появятся в электронном журнале автоматически, как только зарегистрируются в системе и выберут группу <strong>{currentUserGroup}</strong>.
              </p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400">
              💡 <strong>Автоматическое добавление:</strong> при создании профиля учащийся указывает группу «{currentUserGroup}», и его ведомость сразу отображается здесь.
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
            Студенты по запросу «{searchFilter}» не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-[#6B7280] dark:text-[#9CA3AF] bg-gray-50/50 dark:bg-[#181B21]">
                  <th className="py-3 px-4 font-semibold">Студент</th>
                  {trackedTopicsForActiveSubject.map(t => (
                    <th key={t.id} className="py-3 px-2 text-center font-semibold" title={t.title}>
                      <div className="flex flex-col items-center">
                        <span>{t.code}</span>
                        {t.isExam && (
                          <span className="text-[9px] text-rose-500 font-bold uppercase">ОКР</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center font-semibold">Ср. по предм.</th>
                  <th className="py-3 px-3 text-center font-semibold">Общий GPA</th>
                  <th className="py-3 px-4 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredStudents.map(student => {
                  const subjectGrades = getStudentGradesForSubject(student, activeSubject.id);
                  const subjAvg = getSubjectAverage(student, activeSubject.id);
                  const overallGpa = getOverallGPA(student);

                  return (
                    <tr 
                      key={student.studentId} 
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedStudent(student);
                        setModalSubjectId(activeSubject.id);
                      }}
                    >
                      <td className="py-3 px-4 font-medium text-[#111827] dark:text-[#F3F3EF] whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {student.studentName.slice(0, 1)}
                          </div>
                          <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-semibold">
                            {student.studentName}
                          </span>
                        </div>
                      </td>

                      {trackedTopicsForActiveSubject.map(t => {
                        const score = subjectGrades[t.id];
                        return (
                          <td key={t.id} className="py-2 px-2 text-center whitespace-nowrap">
                            <span
                              className={`inline-block min-w-7 py-1 px-1.5 rounded-lg text-xs font-mono ${getScoreBadgeClass(score)}`}
                            >
                              {score !== null && score !== undefined ? score : '—'}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-bold font-mono text-xs px-2.5 py-1 rounded-md ${
                          subjAvg >= 9
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : subjAvg >= 6
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : subjAvg >= 4
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {subjAvg > 0 ? subjAvg : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="font-bold font-mono text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-[#111827] dark:text-[#F3F3EF]">
                          {overallGpa > 0 ? overallGpa : '—'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setModalSubjectId(activeSubject.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors shadow-xs"
                        >
                          <span>Оценки</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT DETAIL MODAL & GRADE SETTER (The requested feature) */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#181B21]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                  {selectedStudent.studentName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F3EF]">
                      {selectedStudent.studentName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Группа {currentUserGroup}
                    </span>
                  </div>
                  <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                    Индивидуальная карточка успеваемости и выставление оценок
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[11px] text-gray-500 uppercase font-semibold">Общий рейтинг (GPA)</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {getOverallGPA(selectedStudent)} / 10
                  </span>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subject Selector Tabs inside Modal */}
            <div className="px-6 pt-3 pb-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15181E] flex items-center gap-2 overflow-x-auto no-scrollbar">
              {subjectsList.map((s) => {
                const isSelected = s.id === modalSubjectId;
                const subjAvg = getSubjectAverage(selectedStudent, s.id);
                const friendlyName = getSubjectFriendlyName(s);
                return (
                  <button
                    key={s.id}
                    onClick={() => setModalSubjectId(s.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-[#1A1E24] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{friendlyName}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {subjAvg > 0 ? `${subjAvg}` : '—'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Active Subject KPI & Overview */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Выбранная дисциплина
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-[#F3F3EF] mt-0.5">
                    {modalSubject.title}
                  </h3>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                    Преподаватель: <strong className="text-gray-800 dark:text-gray-200">{modalSubject.teacher}</strong> • Всего тем: {modalSubject.topics?.length || 0}
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-[#181B21] p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900 shrink-0">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-500 font-medium">Средний балл по предмету</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {getSubjectAverage(selectedStudent, modalSubject.id) || '0.0'}
                      <span className="text-sm font-normal text-gray-400"> / 10</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Assessment items list with interactive 1-10 grade setters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Контрольные мероприятия, тесты и практические работы</span>
                  </h4>
                  <span className="text-xs text-gray-500">
                    Нажмите на оценку от 1 до 10 для мгновенного сохранения
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Topics & Tests */}
                  {modalSubject.topics && modalSubject.topics.map((topic: Topic) => {
                    const studentGrades = getStudentGradesForSubject(selectedStudent, modalSubject.id);
                    const currentScore = studentGrades[topic.id];

                    return (
                      <div 
                        key={topic.id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181B21] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Work description */}
                        <div className="flex items-start gap-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${
                            topic.isExam
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {topic.code}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-semibold text-[#111827] dark:text-[#F3F3EF]">
                                {topic.title}
                              </h5>
                              {topic.isExam && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white uppercase">
                                  ОКР
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                              {topic.test ? `Тест (${topic.test.questions.length} вопр., ${topic.test.durationMinutes} мин)` : 'Устный опрос / защита темы'}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Grade Picker (1-10) */}
                        <div className="flex items-center gap-1.5 flex-wrap self-end md:self-center">
                          <span className="text-xs font-semibold text-gray-500 mr-1 hidden lg:inline">
                            Оценка:
                          </span>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreVal) => {
                            const isSelectedScore = currentScore === scoreVal;
                            return (
                              <button
                                key={scoreVal}
                                onClick={() => handleSetGrade(selectedStudent.studentId, modalSubject.id, topic.id, scoreVal)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all ${
                                  isSelectedScore
                                    ? 'bg-indigo-600 text-white shadow-md scale-110 ring-2 ring-indigo-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                              >
                                {scoreVal}
                              </button>
                            );
                          })}

                          {currentScore !== null && currentScore !== undefined && (
                            <button
                              onClick={() => handleSetGrade(selectedStudent.studentId, modalSubject.id, topic.id, null)}
                              title="Сбросить оценку"
                              className="ml-1 p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Practical works */}
                  {modalSubject.practicalWorks && modalSubject.practicalWorks.map((pr: PracticalWork) => {
                    const prId = `pr-${pr.number}`;
                    const studentGrades = getStudentGradesForSubject(selectedStudent, modalSubject.id);
                    const currentScore = studentGrades[prId];

                    return (
                      <div 
                        key={pr.id || prId}
                        className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-[#181B21] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* Work description */}
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                            ПЗ №{pr.number}
                          </span>
                          <div>
                            <h5 className="text-sm font-semibold text-[#111827] dark:text-[#F3F3EF]">
                              {pr.title}
                            </h5>
                            <span className="text-xs text-[#6B7280] dark:text-[#8E95A2]">
                              Практическая работа • {pr.hours} ч.
                            </span>
                          </div>
                        </div>

                        {/* Interactive Grade Picker (1-10) */}
                        <div className="flex items-center gap-1.5 flex-wrap self-end md:self-center">
                          <span className="text-xs font-semibold text-gray-500 mr-1 hidden lg:inline">
                            Оценка:
                          </span>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((scoreVal) => {
                            const isSelectedScore = currentScore === scoreVal;
                            return (
                              <button
                                key={scoreVal}
                                onClick={() => handleSetGrade(selectedStudent.studentId, modalSubject.id, prId, scoreVal)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all ${
                                  isSelectedScore
                                    ? 'bg-purple-600 text-white shadow-md scale-110 ring-2 ring-purple-400'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                              >
                                {scoreVal}
                              </button>
                            );
                          })}

                          {currentScore !== null && currentScore !== undefined && (
                            <button
                              onClick={() => handleSetGrade(selectedStudent.studentId, modalSubject.id, prId, null)}
                              title="Сбросить оценку"
                              className="ml-1 p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher Notes Section */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Заметки преподавателя по студенту ({getSubjectFriendlyName(modalSubject)}):
                </span>
                <input
                  type="text"
                  defaultValue={selectedStudent.teacherNotes?.[modalSubject.id] || ''}
                  onBlur={(e) => handleSaveTeacherNote(selectedStudent.studentId, modalSubject.id, e.target.value)}
                  placeholder="Например: Назначить пересдачу ОКР в среду, сдать отчёт по практической работе №2..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#121418] border border-gray-300 dark:border-gray-700 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-gray-400">
                  Заметка видна только преподавателям и автоматически сохраняется при выходе из поля.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#181B21] flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Все выставленные оценки моментально пересчитывают средний балл и сохраняются.
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                Закрыть карточку
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={handleConfirmResetAttempt}
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
