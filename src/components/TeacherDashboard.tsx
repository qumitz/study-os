import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Search, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  Layers, 
  RotateCcw, 
  Check, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  FileText,
  Filter,
  Eye,
  Send,
  MessageSquare,
  FastForward
} from 'lucide-react';
import { FastForwardTopicModal } from './FastForwardTopicModal';
import { getGroupCheckpoint, GroupCurriculumCheckpoint } from '../lib/curriculumSync';
import { StudentGradeRecord, Subject, Topic, PracticalWork, PracticalSubmission, CollegeGroup } from '../types';
import { 
  getRegisteredStudentsForGroup, 
  saveGroupStudents, 
  mergeStudentRecords,
  updateStudentDateGrade,
  getStudentDateGrades,
  ACADEMIC_MONTHS,
  AcademicMonth
} from '../lib/studentRegistry';
import { 
  isSupabaseConfigured, 
  fetchGroupStudentsFromDb 
} from '../lib/supabase';
import { getAvailableGroups } from '../lib/groupRegistry';
import { 
  getGroupPracticalSubmissions, 
  gradePracticalSubmission, 
  requestRevisionPracticalSubmission 
} from '../lib/practicalSubmissionRegistry';

export interface TeacherDashboardProps {
  subject: Subject;
  currentUserGroup: string;
  allSubjects?: Subject[];
  onSelectSubject?: (subject: Subject) => void;
}

// Helper: Format subject short title for college tabs
const getSubjectFriendlyName = (s: Subject): string => {
  const map: Record<string, string> = {
    secbasics: 'Информ. безопасность',
    security: 'Информ. безопасность',
    pms: 'ПМС',
    microprocessor: 'ПМС',
    tesvt: 'ТЭСВТ',
    maintenance: 'ТЭСВТ',
    network: 'Сетевые технологии',
    stoi: 'Сетевые технологии',
    pspi: 'ПСПИ',
    transmission: 'ПСПИ',
    mobile: 'Моб. приложения',
    rmp: 'Моб. приложения',
    cad: 'САПР',
    sapr: 'САПР',
    tsi: 'ТСИ'
  };
  if (map[s.id]) return map[s.id];
  if (s.shortTitle && !s.shortTitle.startsWith('5-04') && !s.shortTitle.startsWith('2-40')) {
    return s.shortTitle;
  }
  if (s.title) {
    if (s.title.includes('микропроцессор')) return 'ПМС';
    if (s.title.includes('эксплуатаци')) return 'ТЭСВТ';
    if (s.title.includes('передачи информации')) return 'ПСПИ';
    if (s.title.includes('проектирован')) return 'САПР';
    if (s.title.includes('информатизаци')) return 'ТСИ';
    if (s.title.includes('безопасност')) return 'Информ. безопасность';
    if (s.title.includes('мобильн')) return 'Моб. приложения';
    if (s.title.includes('сетев')) return 'Сетевые технологии';
    return s.title.length > 24 ? s.title.slice(0, 22) + '...' : s.title;
  }
  return s.code;
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  subject,
  currentUserGroup,
  allSubjects = [],
  onSelectSubject
}) => {
  // Available groups
  const [availableGroups, setAvailableGroups] = useState<CollegeGroup[]>(() => getAvailableGroups());
  const [activeGroup, setActiveGroup] = useState<string>(() => {
    if (currentUserGroup && currentUserGroup !== 'Все группы') {
      return currentUserGroup;
    }
    const saved = localStorage.getItem('study_os_teacher_active_group');
    const initialGroups = getAvailableGroups();
    if (saved && initialGroups.some(g => g.name === saved)) {
      return saved;
    }
    return initialGroups[0]?.name || '37В';
  });

  useEffect(() => {
    const handleGroupsUpdated = () => {
      const updated = getAvailableGroups();
      setAvailableGroups(updated);
      if (!updated.some(g => g.name === activeGroup)) {
        setActiveGroup(updated[0]?.name || '37В');
      }
    };
    window.addEventListener('study_os_groups_updated', handleGroupsUpdated);
    return () => window.removeEventListener('study_os_groups_updated', handleGroupsUpdated);
  }, [activeGroup]);

  const handleGroupChange = (groupName: string) => {
    setActiveGroup(groupName);
    localStorage.setItem('study_os_teacher_active_group', groupName);
  };

  // Subtabs state: calendar journal / test results / practical reviews
  const [activeSubTab, setActiveSubTab] = useState<'calendar_journal' | 'test_results' | 'practical_reviews' | 'curriculum_sync'>('calendar_journal');



  // Academic month state for calendar journal: defaults to November 2026 ('2026-11')
  const [selectedMonthId, setSelectedMonthId] = useState<string>('2026-11');
  const currentAcademicMonth: AcademicMonth = useMemo(() => {
    return ACADEMIC_MONTHS.find(m => m.id === selectedMonthId) || ACADEMIC_MONTHS[2];
  }, [selectedMonthId]);

  // Use allSubjects list or fallback to current subject
  const subjectsList = useMemo(() => {
    return allSubjects.length > 0 ? allSubjects : [subject];
  }, [allSubjects, subject]);

  // Active subject in the main journal matrix
  const [activeSubjectId, setActiveSubjectId] = useState<string>(subject.id);
  const activeSubject = useMemo(() => {
    return subjectsList.find(s => s.id === activeSubjectId) || subject;
  }, [subjectsList, activeSubjectId, subject]);

  // Fast-Forward Modal state
  const [showFastForwardModal, setShowFastForwardModal] = useState<boolean>(false);
  const [fastForwardTopicId, setFastForwardTopicId] = useState<string | undefined>(undefined);
  const [activeCheckpoint, setActiveCheckpoint] = useState<GroupCurriculumCheckpoint | null>(() => {
    return getGroupCheckpoint(activeGroup, activeSubjectId);
  });

  const refreshCheckpoint = () => {
    setActiveCheckpoint(getGroupCheckpoint(activeGroup, activeSubjectId));
  };

  useEffect(() => {
    refreshCheckpoint();
  }, [activeGroup, activeSubjectId]);

  useEffect(() => {
    const handleProgressUpdated = () => {
      refreshCheckpoint();
      setStudents(getRegisteredStudentsForGroup(activeGroup));
    };
    window.addEventListener('study_os_progress_updated', handleProgressUpdated);
    return () => window.removeEventListener('study_os_progress_updated', handleProgressUpdated);
  }, [activeGroup, activeSubjectId]);

  // Load registered students for active group
  const [students, setStudents] = useState<StudentGradeRecord[]>(() => {
    return getRegisteredStudentsForGroup(activeGroup);
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [isLiveFromDb, setIsLiveFromDb] = useState<boolean>(false);

  // Selected student for deep detailed inspection modal
  const [selectedStudent, setSelectedStudent] = useState<StudentGradeRecord | null>(null);
  const [modalSubjectId, setModalSubjectId] = useState<string>(subject.id);

  // Reset confirmation state
  const [selectedStudentForReset, setSelectedStudentForReset] = useState<{ 
    student: StudentGradeRecord; 
    topicCode: string; 
    workId: string; 
    subjectId: string 
  } | null>(null);

  // Practical review modal state
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<PracticalSubmission | null>(null);
  const [reviewGradeInput, setReviewGradeInput] = useState<number>(9);
  const [reviewFeedbackInput, setReviewFeedbackInput] = useState<string>('');
  const [syncGradeToJournalDate, setSyncGradeToJournalDate] = useState<boolean>(true);

  // Submissions list for active group & subject
  const [submissionsVersion, setSubmissionsVersion] = useState<number>(0);
  const groupSubmissions = useMemo(() => {
    return getGroupPracticalSubmissions(activeGroup, activeSubject.id);
  }, [activeGroup, activeSubject.id, submissionsVersion]);

  const pendingSubmissionsCount = useMemo(() => {
    return groupSubmissions.filter(s => s.status === 'submitted').length;
  }, [groupSubmissions]);

  // Popover state for quick cell grading in calendar journal
  const [activeGradePopover, setActiveGradePopover] = useState<{
    studentId: string;
    studentName: string;
    dateStr: string; // YYYY-MM-DD
    currentVal: number | string | null;
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

  // Calendar days of the selected academic month
  const monthDays = useMemo(() => {
    const days = [];
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= currentAcademicMonth.daysInMonth; day++) {
      const d = new Date(currentAcademicMonth.year, currentAcademicMonth.monthIndex, day);
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
      const dayStr = day.toString().padStart(2, '0');
      const monthNumStr = (currentAcademicMonth.monthIndex + 1).toString().padStart(2, '0');
      const fullDateStr = `${currentAcademicMonth.year}-${monthNumStr}-${dayStr}`;

      days.push({
        dayNumber: day,
        dayOfWeek: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0, // Sunday
        fullDateStr,
        isToday: fullDateStr === todayStr
      });
    }
    return days;
  }, [currentAcademicMonth]);

  // Helper: get student grades map for any subject
  const getStudentGradesForSubject = (student: StudentGradeRecord, subjId: string): Record<string, number | null> => {
    if (student.subjectGrades && student.subjectGrades[subjId]) {
      return student.subjectGrades[subjId];
    }
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

  // Helper: calculate average score for a student in selected month
  const calculateMonthAverage = (student: StudentGradeRecord, subjId: string): number => {
    const dateGrades = getStudentDateGrades(student, subjId);
    const monthScores: number[] = [];

    monthDays.forEach(d => {
      const val = dateGrades[d.fullDateStr];
      if (typeof val === 'number' && val > 0) {
        monthScores.push(val);
      }
    });

    if (monthScores.length === 0) return 0;
    const sum = monthScores.reduce((a, b) => a + b, 0);
    return Math.round((sum / monthScores.length) * 10) / 10;
  };

  // Helper: get student average for a subject
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

        const updatedTopicGrades = subjId === 'secbasics'
          ? { ...st.topicGrades, [workId]: score }
          : st.topicGrades;

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

      saveGroupStudents(activeGroup, updatedStudents);
      return updatedStudents;
    });
  };

  // Set or update a student's calendar date grade
  const handleSetDateGrade = (studentId: string, dateStr: string, grade: number | string | null) => {
    updateStudentDateGrade(studentId, activeGroup, activeSubject.id, dateStr, grade);
    setStudents(getRegisteredStudentsForGroup(activeGroup));
    setActiveGradePopover(null);
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
      saveGroupStudents(activeGroup, updated);
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

  // Grade practical submission modal submit
  const handleApprovePracticalReview = (grade: number, feedback: string) => {
    if (!activeReviewSubmission) return;
    const graded = gradePracticalSubmission(
      activeReviewSubmission.id,
      grade,
      feedback,
      activeSubject.teacher || 'Селедцов Александр Игоревич'
    );

    if (graded && syncGradeToJournalDate) {
      // Sync grade into journal on the submission date
      const subDate = activeReviewSubmission.submittedAt.split('T')[0];
      handleSetDateGrade(activeReviewSubmission.studentId, subDate, grade);
    }

    setSubmissionsVersion(v => v + 1);
    setActiveReviewSubmission(null);
  };

  const handleReturnPracticalReview = (feedback: string) => {
    if (!activeReviewSubmission) return;
    requestRevisionPracticalSubmission(
      activeReviewSubmission.id,
      feedback,
      activeSubject.teacher || 'Селедцов Александр Игоревич'
    );
    setSubmissionsVersion(v => v + 1);
    setActiveReviewSubmission(null);
  };

  // Filter students
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

  const getScoreBadgeClass = (score: number | string | null | undefined) => {
    if (score === null || score === undefined || score === '') return 'text-gray-300 dark:text-gray-700';
    if (score === 'н') return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold';
    if (score === 'уп') return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold';
    const num = Number(score);
    if (num >= 9) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold';
    if (num >= 6) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold';
    if (num >= 4) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold';
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
          <button
            type="button"
            onClick={() => {
              setFastForwardTopicId(undefined);
              setShowFastForwardModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            title="Перевести всех учеников на конкретную тему и зачесть предыдущие"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Перевести группу к теме</span>
          </button>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">
                Журнал группы {activeGroup}
              </h1>
              {/* Group Selector */}
              <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Группа:</span>
                <select
                  value={activeGroup}
                  onChange={(e) => handleGroupChange(e.target.value)}
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

            {/* Quick Group Tabs for Teacher */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Группы:
              </span>
              {availableGroups.map((g) => {
                const isSelected = activeGroup === g.name;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGroupChange(g.name)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-gray-100 dark:bg-[#1E232B] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/80 dark:border-gray-800'
                    }`}
                  >
                    <span>Группа {g.name}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'text-gray-400'}`}>
                      {g.course} курс
                    </span>
                  </button>
                );
              })}
            </div>
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
            onClick={() => alert(`Ведомость группы ${activeGroup} по предмету "${activeSubject.title}" успешно сформирована в формате Excel/CSV!`)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1E24] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Экспорт ведомости</span>
          </button>
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveSubTab('calendar_journal')}
          className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'calendar_journal'
              ? 'bg-white dark:bg-[#20252F] text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Журнал по датам (01.09 — 30.06)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('test_results')}
          className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'test_results'
              ? 'bg-white dark:bg-[#20252F] text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Оценки за тесты</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('practical_reviews')}
          className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            activeSubTab === 'practical_reviews'
              ? 'bg-white dark:bg-[#20252F] text-indigo-600 dark:text-indigo-400 shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Проверка практических и лабораторных</span>
          {pendingSubmissionsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingSubmissionsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('curriculum_sync')}
          className={`py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'curriculum_sync'
              ? 'bg-white dark:bg-[#20252F] text-blue-600 dark:text-blue-400 shadow-sm font-bold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <FastForward className="w-4 h-4 text-blue-500" />
          <span>Темы и прогресс</span>
        </button>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            Выберите предмет для отображения:
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
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

      {/* =====================================================================
          SUBTAB 1: КАЛЕНДАРНЫЙ ЖУРНАЛ ПО ДАТАМ (01.09 — 30.06)
          ===================================================================== */}
      {activeSubTab === 'calendar_journal' && (
        <div className="space-y-4">
          {/* Academic Months Ribbon (01.09 - 30.06) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Учебный календарь: выбор месяца обучения
              </span>
              <span className="text-[11px] text-gray-400">
                Учебный год 2026/2027 • 01.09 — 30.06
              </span>
            </div>

            {/* Months Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {ACADEMIC_MONTHS.map(m => {
                const isSelected = m.id === selectedMonthId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMonthId(m.id)}
                    className={`px-3 py-2 rounded-xl text-center border transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-gray-50 dark:bg-[#181B21] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-xs font-semibold block leading-tight">{m.name}</span>
                    <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                      {m.semester}-й сем.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] shadow-sm overflow-hidden p-3.5 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Журнал: {currentAcademicMonth.name} {currentAcademicMonth.year} • {activeSubject.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Нажмите на любую ячейку даты, чтобы выставить оценку (1–10) или отметку посещаемости («н», «уп»)
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Поиск по фамилии..."
                  className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-base sm:text-xs rounded-xl bg-gray-50 dark:bg-[#1A1E24] border border-[#E5E7EB] dark:border-[#262A32] text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
                Студенты не найдены
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-[#6B7280] dark:text-[#9CA3AF] bg-gray-50/50 dark:bg-[#181B21]">
                      <th className="py-3 px-3 font-semibold sticky left-0 bg-gray-50 dark:bg-[#181B21] z-10 w-48 shadow-xs">
                        Студент
                      </th>

                      {monthDays.map(d => (
                        <th
                          key={d.fullDateStr}
                          className={`py-2 px-1 text-center font-semibold min-w-8 ${
                            d.isToday 
                              ? 'bg-blue-100/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' 
                              : d.isWeekend 
                              ? 'bg-gray-100/40 dark:bg-gray-800/20 text-gray-400' 
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 font-normal">{d.dayOfWeek}</span>
                            <span className="font-bold text-xs">{d.dayNumber}</span>
                          </div>
                        </th>
                      ))}

                      <th className="py-3 px-3 text-center font-bold whitespace-nowrap bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300">
                        Ср. (мес)
                      </th>
                      <th className="py-3 px-3 text-center font-bold whitespace-nowrap bg-gray-50 dark:bg-[#181B21]">
                        Итог
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {filteredStudents.map((student, sIdx) => {
                      const dateGrades = getStudentDateGrades(student, activeSubject.id);
                      const monthAvg = calculateMonthAverage(student, activeSubject.id);
                      const subjAvg = getSubjectAverage(student, activeSubject.id);

                      return (
                        <tr key={student.studentId} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-[#111827] dark:text-[#F3F3EF] whitespace-nowrap sticky left-0 bg-white dark:bg-[#15181E] z-10 shadow-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-[11px] w-4">{sIdx + 1}.</span>
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setModalSubjectId(activeSubject.id);
                                }}
                                className="font-semibold text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer truncate max-w-[170px]"
                              >
                                {student.studentName}
                              </button>
                            </div>
                          </td>

                          {monthDays.map(d => {
                            const val = dateGrades[d.fullDateStr];
                            const isTestScore = Boolean(
                              student.testAttempts?.[activeSubject.id]?.some(a => a.date === d.fullDateStr)
                            );

                            return (
                              <td 
                                key={d.fullDateStr} 
                                onClick={() => setActiveGradePopover({
                                  studentId: student.studentId,
                                  studentName: student.studentName,
                                  dateStr: d.fullDateStr,
                                  currentVal: val ?? null
                                })}
                                className={`py-1.5 px-0.5 text-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-all ${
                                  d.isToday ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                                }`}
                              >
                                <div className="relative inline-flex items-center justify-center">
                                  <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-mono select-none ${getScoreBadgeClass(val)}`}
                                  >
                                    {val !== null && val !== undefined && val !== '' ? val : '·'}
                                  </span>
                                  {isTestScore && (
                                    <span 
                                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 ring-1 ring-white dark:ring-gray-900" 
                                      title="Оценка за тест"
                                    />
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          <td className="py-2 px-2 text-center whitespace-nowrap bg-indigo-50/20 dark:bg-indigo-950/10">
                            <span className={`font-bold font-mono text-xs px-2 py-0.5 rounded-md ${
                              monthAvg >= 9 ? 'text-emerald-600' : monthAvg >= 6 ? 'text-blue-600' : monthAvg >= 4 ? 'text-amber-600' : 'text-gray-400'
                            }`}>
                              {monthAvg > 0 ? monthAvg : '—'}
                            </span>
                          </td>

                          <td className="py-2 px-2 text-center whitespace-nowrap">
                            <span className="font-bold font-mono text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                              {subjAvg > 0 ? subjAvg : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUBTAB 2: РЕЗУЛЬТАТЫ ТЕСТОВ
          ===================================================================== */}
      {activeSubTab === 'test_results' && (
        <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Результаты тестирования: {activeSubject.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Автоматически зафиксированные попытки прохождения тестов и контрольных срезов учащимися группы {activeGroup}
              </p>
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-[#6B7280] dark:text-[#9CA3AF] bg-gray-50/50 dark:bg-[#181B21]">
                  <th className="py-3 px-4 font-semibold">Студент</th>
                  <th className="py-3 px-3 font-semibold">Тема / Тест</th>
                  <th className="py-3 px-3 text-center font-semibold">Балл (1–10)</th>
                  <th className="py-3 px-3 text-center font-semibold">Дата сдачи</th>
                  <th className="py-3 px-3 text-center font-semibold">Правильных ответов</th>
                  <th className="py-3 px-4 text-right font-semibold">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {filteredStudents.flatMap(student => {
                  const attempts = student.testAttempts?.[activeSubject.id] || [];
                  const subjectGrades = getStudentGradesForSubject(student, activeSubject.id);

                  // If student has explicit attempts:
                  if (attempts.length > 0) {
                    return attempts.map((att, attIdx) => (
                      <tr key={`${student.studentId}-${att.topicId}-${attIdx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-medium text-[#111827] dark:text-[#F3F3EF]">
                          {student.studentName}
                        </td>
                        <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">{att.topicCode}</span>
                          <span>{att.topicTitle || 'Тестирование по теме'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block py-1 px-2.5 rounded-lg text-xs font-mono font-bold ${getScoreBadgeClass(att.score)}`}>
                            {att.score} из 10
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-500">
                          {att.date || new Date(att.completedAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-300 font-mono">
                          {att.correctCount !== undefined && att.totalQuestions 
                            ? `${att.correctCount} / ${att.totalQuestions} (${Math.round((att.correctCount / att.totalQuestions) * 100)}%)` 
                            : 'Сдано'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForReset({
                              student,
                              topicCode: att.topicCode || att.topicId,
                              workId: att.topicId,
                              subjectId: activeSubject.id
                            })}
                            className="px-2.5 py-1 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            Сбросить попытку
                          </button>
                        </td>
                      </tr>
                    ));
                  }

                  // Fallback to topic grades matrix if no detailed attempt objects yet
                  const topicsWithGrades = Object.entries(subjectGrades).filter(([_, score]) => score !== null);
                  return topicsWithGrades.map(([topicId, score]) => {
                    const topicObj = activeSubject.topics?.find(t => t.id === topicId);
                    return (
                      <tr key={`${student.studentId}-${topicId}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="py-3 px-4 font-medium text-[#111827] dark:text-[#F3F3EF]">
                          {student.studentName}
                        </td>
                        <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">{topicObj?.code || 'Тест'}</span>
                          <span>{topicObj?.title || 'Тестирование'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block py-1 px-2.5 rounded-lg text-xs font-mono font-bold ${getScoreBadgeClass(score)}`}>
                            {score} из 10
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-500">
                          {new Date().toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-500">
                          Сдано
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForReset({
                              student,
                              topicCode: topicObj?.code || topicId,
                              workId: topicId,
                              subjectId: activeSubject.id
                            })}
                            className="px-2.5 py-1 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            Сбросить попытку
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUBTAB 3: ПРОВЕРКА ПРАКТИЧЕСКИХ И ЛАБОРАТОРНЫХ
          ===================================================================== */}
      {activeSubTab === 'practical_reviews' && (
        <div className="rounded-2xl border border-[#E5E7EB] dark:border-[#262A32] bg-white dark:bg-[#15181E] shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Проверка практических и лабораторных работ
                </h3>
                {pendingSubmissionsCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {pendingSubmissionsCount} ожидают проверки
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeSubject.title} • Проверка отчётов, оформленных студентами во встроенном текстовом редакторе
              </p>
            </div>
          </div>

          {groupSubmissions.length === 0 ? (
            <div className="py-16 text-center space-y-3 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                Сданных работ по предмету «{getSubjectFriendlyName(activeSubject)}» пока нет
              </h4>
              <p className="text-xs text-gray-500 max-w-sm">
                Как только учащийся нажмёт «Отправить на проверку» в редакторе отчёта, его работа сразу появится здесь.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181B21] shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        Работа № {sub.workNumber}
                      </span>
                      {sub.status === 'submitted' && (
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ожидает проверки
                        </span>
                      )}
                      {sub.status === 'graded' && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Проверено • {sub.grade}/10
                        </span>
                      )}
                      {sub.status === 'needs_revision' && (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          На доработке
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                      {sub.workTitle}
                    </h4>

                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p><strong>Студент:</strong> {sub.studentName} (Группа {sub.group})</p>
                      <p><strong>Отправлено:</strong> {new Date(sub.submittedAt).toLocaleString('ru-RU')}</p>
                    </div>

                    {sub.teacherFeedback && (
                      <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs italic text-gray-600 dark:text-gray-400">
                        Замечания: «{sub.teacherFeedback}»
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Обновлено: {new Date(sub.updatedAt).toLocaleTimeString()}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveReviewSubmission(sub);
                        setReviewGradeInput(sub.grade || 9);
                        setReviewFeedbackInput(sub.teacherFeedback || '');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{sub.status === 'graded' ? 'Посмотреть отчёт' : 'Проверить работу'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: УПРАВЛЕНИЕ ТЕМАМИ И БЫСТРЫЙ ЗАЧЁТ (СИНХРОНИЗАЦИЯ ПРОГРЕССА)
          ===================================================================== */}
      {activeSubTab === 'curriculum_sync' && (
        <div className="space-y-4">
          {/* Checkpoint Status Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FastForward className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                    Синхронизация прогресса группы {activeGroup}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {activeSubject.title}
                  </span>
                </div>
                {activeCheckpoint ? (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                    Текущая изучаемая тема группы:{' '}
                    <strong className="text-blue-600 dark:text-blue-400 font-semibold">
                      {activeCheckpoint.targetTopicCode} — {activeCheckpoint.targetTopicTitle}
                    </strong>
                    . Все предшествующие темы ({activeCheckpoint.completedTopicIds.length} шт.) автоматически зачтены ученикам.
                  </p>
                ) : (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                    Чекпоинт для группы пока не установлен. Студенты начинают с первой темы. Выберите тему ниже, чтобы мгновенно зачесть все пройденные материалы колледжа.
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFastForwardTopicId(undefined);
                setShowFastForwardModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <FastForward className="w-4 h-4" />
              <span>Перевести группу к теме</span>
            </button>
          </div>

          {/* Sections and Topics Matrix */}
          <div className="space-y-4">
            {activeSubject.sections.map((section) => {
              const sectionTopics = activeSubject.topics.filter(t => t.sectionId === section.id || section.topicIds?.includes(t.id));

              return (
                <div
                  key={section.id}
                  className="rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs overflow-hidden"
                >
                  {/* Section Header */}
                  <div className="px-4 sm:px-5 py-3 bg-[#F9FAFB] dark:bg-[#1A1E26] border-b border-[#E5E7EB] dark:border-[#262A32] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {section.romanNum}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                        {section.title}
                      </h4>
                    </div>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {section.hours} ч. • {sectionTopics.length} тем
                    </span>
                  </div>

                  {/* Topics List */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {sectionTopics.map((topic) => {
                      const isCompletedByCheckpoint = activeCheckpoint?.completedTopicIds.includes(topic.id);
                      const isTargetCheckpoint = activeCheckpoint?.targetTopicId === topic.id;

                      return (
                        <div
                          key={topic.id}
                          className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isTargetCheckpoint
                              ? 'bg-blue-50/50 dark:bg-blue-950/20'
                              : isCompletedByCheckpoint
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/10'
                              : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/30'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 font-mono ${
                              isTargetCheckpoint
                                ? 'bg-blue-600 text-white shadow-xs'
                                : isCompletedByCheckpoint
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                            }`}>
                              {topic.code}
                            </span>
                            <div>
                              <div className="text-xs sm:text-sm font-semibold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                                {topic.title}
                              </div>
                              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 line-clamp-1">
                                {topic.shortDescription}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                            {isTargetCheckpoint ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                <FastForward className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                <span>Текущая тема группы</span>
                              </span>
                            ) : isCompletedByCheckpoint ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Зачтено группе</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs text-gray-400 bg-gray-100 dark:bg-gray-800/60">
                                Закрыто
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setFastForwardTopicId(topic.id);
                                setShowFastForwardModal(true);
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                                isTargetCheckpoint
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                                  : 'border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                              }`}
                              title={`Перевести группу на тему ${topic.code} и зачесть все темы до неё`}
                            >
                              <FastForward className="w-3.5 h-3.5" />
                              <span>{isTargetCheckpoint ? 'Текущая' : 'Сделать текущей'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          POPOVER: БЫСТРОЕ ВЫСТАВЛЕНИЕ ОЦЕНКИ В КАЛЕНДАРНОМ ЖУРНАЛЕ
          ===================================================================== */}
      {activeGradePopover && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveGradePopover(null)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161920] border border-gray-200 dark:border-gray-800 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Выставить оценку в журнал
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeGradePopover.studentName} • Дата: {activeGradePopover.dateStr}
                </p>
              </div>
              <button 
                onClick={() => setActiveGradePopover(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 10-point Scale Buttons */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Балл за пару (1 — 10):
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleSetDateGrade(activeGradePopover.studentId, activeGradePopover.dateStr, n)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono transition-transform hover:scale-105 cursor-pointer ${
                      n >= 9 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : n >= 6 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : n >= 4 
                        ? 'bg-amber-500 text-white shadow-xs' 
                        : 'bg-rose-600 text-white shadow-xs'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendance Marks */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Отметка посещаемости:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetDateGrade(activeGradePopover.studentId, activeGradePopover.dateStr, 'н')}
                  className="py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  н (пропуск занятия)
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDateGrade(activeGradePopover.studentId, activeGradePopover.dateStr, 'уп')}
                  className="py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  уп (уважительная)
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSetDateGrade(activeGradePopover.studentId, activeGradePopover.dateStr, null)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Очистить оценку
              </button>
              <button
                type="button"
                onClick={() => setActiveGradePopover(null)}
                className="px-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ПРОВЕРКА РАБОТЫ ПРЕПОДАВАТЕЛЕМ (ОТЧЁТ ВОРД)
          ===================================================================== */}
      {activeReviewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-5xl h-[94vh] sm:h-[92vh] rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#181B21] flex items-center justify-between shrink-0 gap-2">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-[#F3F3EF] truncate">
                  Проверка: Практическая работа № {activeReviewSubmission.workNumber}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                  {activeReviewSubmission.subjectTitle} • Учащийся: <strong>{activeReviewSubmission.studentName}</strong> ({activeReviewSubmission.group})
                </p>
              </div>

              <button
                onClick={() => setActiveReviewSubmission(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Content: Left Document View, Right Grading Panel */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Document View */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-8 bg-[#F1F3F5] dark:bg-[#0D0F14] flex justify-center">
                <div 
                  className="w-full max-w-[800px] bg-white dark:bg-[#1A1D24] border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 sm:p-12 text-gray-900 dark:text-gray-100 leading-relaxed font-serif"
                  style={{
                    fontFamily: "'Times New Roman', serif",
                    fontSize: '14pt',
                    lineHeight: '1.6'
                  }}
                  dangerouslySetInnerHTML={{ __html: activeReviewSubmission.contentHtml }}
                />
              </div>

              {/* Right Grading & Feedback Panel */}
              <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15181E] p-4 sm:p-5 flex flex-col justify-between shrink-0 overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Оценка и рецензия
                  </h4>

                  {/* Score Buttons */}
                  <div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                      Оценка за работу (1–10):
                    </span>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewGradeInput(n)}
                          className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                            reviewGradeInput === n
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 scale-105'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                      Комментарий / Замечания преподавателя:
                    </label>
                    <textarea
                      rows={4}
                      value={reviewFeedbackInput}
                      onChange={(e) => setReviewFeedbackInput(e.target.value)}
                      placeholder="Например: Работа выполнена в полном объёме, выводы сделаны корректно..."
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1E24] text-base sm:text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  {/* Sync to journal date checkbox */}
                  <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={syncGradeToJournalDate}
                      onChange={(e) => setSyncGradeToJournalDate(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span>Занести оценку в журнал на дату сдачи ({activeReviewSubmission.submittedAt.split('T')[0]})</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => handleApprovePracticalReview(reviewGradeInput, reviewFeedbackInput)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Утвердить оценку ({reviewGradeInput}/10)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReturnPracticalReview(reviewFeedbackInput || 'Требуется доработка')}
                    className="w-full py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Вернуть на доработку</span>
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ИНДИВИДУАЛЬНАЯ КАРТОЧКА СТУДЕНТА
          ===================================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-4xl max-h-[92vh] rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#181B21]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {selectedStudent.studentName.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-[#F3F3EF]">
                    {selectedStudent.studentName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    Учащийся группы {selectedStudent.group} • Общий GPA: <strong>{getOverallGPA(selectedStudent)}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Disciplines Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Выберите предмет для выставления оценок:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {subjectsList.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setModalSubjectId(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                        modalSubjectId === s.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {getSubjectFriendlyName(s)}: <strong>{getSubjectAverage(selectedStudent, s.id) || '—'}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics Grading Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Темы и срезы знаний: {modalSubject.title}
                  </span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    Средний балл по предмету: {getSubjectAverage(selectedStudent, modalSubject.id) || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {modalSubject.topics && modalSubject.topics.map((t: Topic) => {
                    const studentGrades = getStudentGradesForSubject(selectedStudent, modalSubject.id);
                    const currentScore = studentGrades[t.id];

                    return (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181B21] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t.code}</span>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate block">
                              {t.title}
                            </span>
                          </div>
                        </div>

                        {/* Grading buttons 1-10 */}
                        <div className="flex items-center gap-1 shrink-0">
                          {[10, 8, 6, 4].map(scoreVal => {
                            const isSelectedScore = currentScore === scoreVal;
                            return (
                              <button
                                key={scoreVal}
                                onClick={() => handleSetGrade(selectedStudent.studentId, modalSubject.id, t.id, scoreVal)}
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
                              onClick={() => handleSetGrade(selectedStudent.studentId, modalSubject.id, t.id, null)}
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
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#181B21] flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Все выставленные оценки моментально сохраняются и пересчитывают средний балл.
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
              Вы уверены, что хотите сбросить оценку студенту <strong className="text-gray-900 dark:text-gray-200">{selectedStudentForReset.student.studentName}</strong>? Студент получит возможность пройти тест заново.
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

      {/* Fast-Forward Topic Modal */}
      <FastForwardTopicModal
        isOpen={showFastForwardModal}
        onClose={() => setShowFastForwardModal(false)}
        subject={activeSubject}
        allSubjects={subjectsList}
        initialTopicId={fastForwardTopicId}
        initialGroupName={activeGroup}
        currentTeacherName="Преподаватель"
        onSuccess={() => {
          refreshCheckpoint();
          setStudents(getRegisteredStudentsForGroup(activeGroup));
        }}
      />
    </div>
  );
};
