import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertTriangle, 
  Edit3, 
  GraduationCap, 
  Layers, 
  Database, 
  Save, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Mail, 
  Building, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { User, Subject, ScheduleItem, TeacherRecord, Topic, PracticalWork } from '../types';
import { 
  isSupabaseConfigured, 
  fetchAllProfilesFromDb, 
  deleteProfileFromDb, 
  createTeacherProfileInDb,
  isSuperAdminEmail 
} from '../lib/supabase';
import { getRegisteredStudentsForGroup, removeStudentFromRegistry } from '../lib/studentRegistry';

interface AdminPanelProps {
  currentUser: User;
  allSubjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  scheduleItems: ScheduleItem[];
  onUpdateSchedule: (items: ScheduleItem[]) => void;
  onSwitchTab?: (tab: string) => void;
}

const DEFAULT_TEACHERS: TeacherRecord[] = [
  {
    id: 'tch-seledtsov-1',
    name: 'Селедцов Александр Игоревич',
    email: 'a.seledtsov@lidacollege.by',
    department: 'ЦК программного обеспечения и информационных технологий',
    subjects: ['secbasics', 'network', 'pms', 'transmission', 'mobile', 'cad', 'tsi', 'tesvt'],
    room: 'Ауд. 312'
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  allSubjects,
  onAddSubject,
  onDeleteSubject,
  scheduleItems,
  onUpdateSchedule
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'subjects' | 'teachers' | 'schedule'>('users');
  const hasSupabase = isSupabaseConfigured();

  // Notification message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  /* =========================================================================
     1. USERS MANAGEMENT (STUDENTS & TEACHERS) WITH 1-CLICK DELETE
     ========================================================================= */
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  
  // User to be deleted (confirmation modal state)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  // Load all users from Supabase and local registry
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const mergedMap = new Map<string, User>();

      // 1. Load local students
      const localStudents = getRegisteredStudentsForGroup('37В');
      localStudents.forEach(s => {
        mergedMap.set(s.studentId, {
          id: s.studentId,
          name: s.studentName,
          email: s.studentId.includes('@') ? s.studentId : `${s.studentId}@student.lidacollege.by`,
          role: 'student',
          group: s.group || '37В',
          course: 3
        });
      });

      // 2. Load teachers from local storage
      const savedTeachers = localStorage.getItem('study_os_teachers');
      if (savedTeachers) {
        try {
          const teachers: TeacherRecord[] = JSON.parse(savedTeachers);
          teachers.forEach(t => {
            mergedMap.set(t.id, {
              id: t.id,
              name: t.name,
              email: t.email,
              role: 'teacher',
              group: '37В',
              course: 3
            });
          });
        } catch (e) {
          console.error(e);
        }
      }

      // Add default teacher
      DEFAULT_TEACHERS.forEach(t => {
        if (!mergedMap.has(t.id)) {
          mergedMap.set(t.id, {
            id: t.id,
            name: t.name,
            email: t.email,
            role: 'teacher',
            group: '37В',
            course: 3
          });
        }
      });

      // 3. Load from Supabase cloud database if configured
      if (hasSupabase) {
        const cloudProfiles = await fetchAllProfilesFromDb();
        cloudProfiles.forEach(p => {
          mergedMap.set(p.id, p);
        });
      }

      // Always ensure current user is present
      if (currentUser?.id) {
        mergedMap.set(currentUser.id, currentUser);
      }

      setUsersList(Array.from(mergedMap.values()));
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [hasSupabase]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u.group && u.group.toLowerCase().includes(userSearchQuery.toLowerCase()));
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearchQuery, userRoleFilter]);

  // Handle User Deletion (From Supabase Cloud & Local Storage)
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);

    try {
      // 1. Delete from Supabase cloud database
      if (hasSupabase && !userToDelete.id.startsWith('local-')) {
        const res = await deleteProfileFromDb(userToDelete.id);
        if (!res.success && res.error) {
          console.warn('Supabase delete returned warning:', res.error);
        }
      }

      // 2. Delete from local students registry
      removeStudentFromRegistry(userToDelete.id, userToDelete.group || '37В');

      // 3. Delete from local teachers list if teacher
      if (userToDelete.role === 'teacher') {
        const savedTeachers = localStorage.getItem('study_os_teachers');
        if (savedTeachers) {
          try {
            const list: TeacherRecord[] = JSON.parse(savedTeachers);
            const updated = list.filter(t => t.id !== userToDelete.id && t.email !== userToDelete.email);
            localStorage.setItem('study_os_teachers', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
      }

      // 4. Update UI state
      setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
      showToast(`Пользователь ${userToDelete.name} удалён из системы и базы данных`, 'success');
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(`Ошибка удаления: ${err.message || 'Сбой сети'}`, 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  /* =========================================================================
     2. SUBJECTS MANAGEMENT (ADD / DELETE SUBJECTS)
     ========================================================================= */
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // New subject form fields
  const [newSubjTitle, setNewSubjTitle] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjTeacher, setNewSubjTeacher] = useState('Селедцов Александр Игоревич');
  const [newSubjTotalHours, setNewSubjTotalHours] = useState(72);
  const [newSubjTheoryHours, setNewSubjTheoryHours] = useState(36);
  const [newSubjPracticeHours, setNewSubjPracticeHours] = useState(36);
  const [newSubjDescription, setNewSubjDescription] = useState('');
  const [newSubjIntroTopic, setNewSubjIntroTopic] = useState('Введение в дисциплину, цели и задачи курса');

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjTitle.trim() || !newSubjCode.trim()) {
      showToast('Укажите название и код дисциплины', 'error');
      return;
    }

    const uniqueId = `custom-subj-${Date.now()}`;
    const firstTopicId = `${uniqueId}-t1`;

    const initialTopic: Topic = {
      id: firstTopicId,
      code: '1.1',
      title: newSubjIntroTopic.trim() || 'Введение в дисциплину',
      hours: 2,
      sectionId: 'sec-1',
      shortDescription: `Базовые понятия, терминология и предмет изучения дисциплины «${newSubjTitle.trim()}».`,
      synopsis: {
        summary: `Обзор целей, задач, структуры и ключевых стандартов дисциплины «${newSubjTitle.trim()}».`,
        keyPoints: [
          'Цели и задачи изучения дисциплины в колледже',
          'Нормативная и методическая база',
          'Основные понятия, архитектурные принципы и терминологический аппарат',
          'Связь с другими специальными предметами специальности'
        ],
        content: `# Тема 1.1 ${newSubjIntroTopic.trim() || 'Введение в дисциплину'}\n\n## 1. Назначение и цели изучения дисциплины\n\nДисциплина **«${newSubjTitle.trim()}»** входит в цикл специальных дисциплин подготовки специалистов среднего специального образования.\n\n### Задачи изучения дисциплины:\n- Формирование фундаментальных теоретических знаний в предметной области;\n- Освоение практических навыков настройки, проектирования и эксплуатации профильных аппаратных и программных средств;\n- Изучение действующих стандартов Республики Беларусь и международных регламентов (ISO, IEEE, ГОСТ).\n\n## 2. Основные разделы и компетенции\n\nВ процессе освоения курса учащиеся изучают теоретические лекции, выполняют лабораторно-практические работы и проходят контрольное тестирование по каждому тематическому разделу.`
      },
      test: {
        id: `test-${firstTopicId}`,
        title: `Тест по теме 1.1: ${newSubjIntroTopic.trim() || 'Введение'}`,
        durationMinutes: 15,
        maxScore: 10,
        questions: [
          {
            id: `q-${firstTopicId}-1`,
            question: `Какова основная цель изучения дисциплины «${newSubjTitle.trim()}»?`,
            options: [
              'Освоение профессиональных теоретических знаний и прикладных навыков в соответствии с учебной программой',
              'Только подготовка к сдаче экзаменационной сессии',
              'Изучение исключительно истории развития вычислительной техники',
              'Свободное времяпрепровождение в компьютерном классе'
            ],
            correctIndex: 0,
            explanation: 'Основная цель — формирование профессиональных компетенций и практических навыков согласно образовательному стандарту.'
          },
          {
            id: `q-${firstTopicId}-2`,
            question: 'Какое соотношение теоретических и практических занятий предусмотрено рабочей программой?',
            options: [
              `Теория: ${newSubjTheoryHours} ч., Практика: ${newSubjPracticeHours} ч.`,
              'Только 100% теория',
              'Практические занятия не предусмотрены',
              'Свободное распределение без стандартов'
            ],
            correctIndex: 0,
            explanation: `Согласно утвержденной учебной программе объем составляет: теория — ${newSubjTheoryHours} ч., практика — ${newSubjPracticeHours} ч.`
          }
        ]
      },
      prerequisites: [],
      position: { x: 300, y: 120 }
    };

    const initialPracticals: PracticalWork[] = [
      {
        id: 1,
        number: 1,
        title: `Практическая работа №1: Базовое конфигурирование и изучение инструментария курса «${newSubjTitle.trim()}»`,
        hours: 4,
        goals: 'Ознакомиться с инструментальной средой, настроить рабочее место и выполнить базовые расчеты.',
        tasks: [
          'Подготовить рабочую станцию к лабораторному практикуму',
          'Выполнить практические задания по методическому руководству',
          'Оформить отчет в соответствии со стандартами колледжа'
        ],
        sampleReport: 'Отчет оформляется в электронном виде с титульным листом, схемами и выводами.'
      }
    ];

    const newSubject: Subject = {
      id: uniqueId,
      title: newSubjTitle.trim(),
      shortTitle: newSubjCode.trim(),
      code: newSubjCode.trim(),
      subtitle: `Учебная дисциплина специальности ПОИТ / ТЭСВТ • Лидский колледж`,
      department: 'ЦК программного обеспечения и информационных технологий',
      teacher: newSubjTeacher.trim(),
      group: '37В',
      course: 3,
      totalHours: Number(newSubjTotalHours) || 72,
      theoryHours: Number(newSubjTheoryHours) || 36,
      practiceHours: Number(newSubjPracticeHours) || 36,
      sections: [
        {
          id: 'sec-1',
          romanNum: 'I',
          title: 'Основы и базовые принципы дисциплины',
          hours: 12,
          practiceHours: 6,
          topicIds: [firstTopicId]
        }
      ],
      topics: [initialTopic],
      practicalWorks: initialPracticals
    };

    onAddSubject(newSubject);
    showToast(`Предмет «${newSubject.title}» успешно добавлен в систему!`, 'success');
    setIsAddSubjectModalOpen(false);
    
    // Reset form
    setNewSubjTitle('');
    setNewSubjCode('');
    setNewSubjDescription('');
  };

  const handleConfirmDeleteSubject = () => {
    if (!subjectToDelete) return;
    onDeleteSubject(subjectToDelete.id);
    showToast(`Предмет «${subjectToDelete.title}» удалён`, 'success');
    setSubjectToDelete(null);
  };

  /* =========================================================================
     3. TEACHERS MANAGEMENT
     ========================================================================= */
  const [teachersList, setTeachersList] = useState<TeacherRecord[]>(() => {
    const saved = localStorage.getItem('study_os_teachers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_TEACHERS;
  });

  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherRecord | null>(null);

  // New teacher form fields
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherDept, setNewTeacherDept] = useState('ЦК программного обеспечения');
  const [newTeacherRoom, setNewTeacherRoom] = useState('Ауд. 312');
  const [newTeacherSelectedSubjs, setNewTeacherSelectedSubjs] = useState<string[]>([]);

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim()) {
      showToast('Укажите ФИО преподавателя', 'error');
      return;
    }

    const teacherId = `tch-${Date.now()}`;
    const email = newTeacherEmail.trim() || `${newTeacherName.toLowerCase().replace(/\s+/g, '.')}@lidacollege.by`;

    const newTeacher: TeacherRecord = {
      id: teacherId,
      name: newTeacherName.trim(),
      email: email,
      department: newTeacherDept.trim(),
      room: newTeacherRoom.trim(),
      subjects: newTeacherSelectedSubjs
    };

    // Save locally
    const updated = [...teachersList, newTeacher];
    setTeachersList(updated);
    localStorage.setItem('study_os_teachers', JSON.stringify(updated));

    // Save to Supabase
    if (hasSupabase) {
      await createTeacherProfileInDb({
        id: teacherId,
        name: newTeacher.name,
        email: newTeacher.email,
        group: '37В',
        course: 3
      });
    }

    // Refresh users list as well
    loadUsers();

    showToast(`Преподаватель ${newTeacher.name} успешно зарегистрирован!`, 'success');
    setIsAddTeacherModalOpen(false);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherSelectedSubjs([]);
  };

  const handleConfirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    const updated = teachersList.filter(t => t.id !== teacherToDelete.id);
    setTeachersList(updated);
    localStorage.setItem('study_os_teachers', JSON.stringify(updated));

    // Also delete user profile if exists in Supabase
    if (hasSupabase) {
      await deleteProfileFromDb(teacherToDelete.id);
    }

    loadUsers();
    showToast(`Преподаватель ${teacherToDelete.name} удалён`, 'success');
    setTeacherToDelete(null);
  };

  /* =========================================================================
     4. SCHEDULE MANAGEMENT
     ========================================================================= */
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isAddPairModalOpen, setIsAddPairModalOpen] = useState(false);

  // New schedule pair fields
  const [pairDay, setPairDay] = useState<number>(0);
  const [pairTime, setPairTime] = useState<string>('08:30 - 10:00');
  const [pairSubject, setPairSubject] = useState<string>(allSubjects[0]?.title || 'Основы информационной безопасности');
  const [pairRoom, setPairRoom] = useState<string>('Ауд. 312');
  const [pairTeacher, setPairTeacher] = useState<string>('Селедцов А.И.');
  const [pairType, setPairType] = useState<string>('Лекция');

  const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const TIME_SLOTS = [
    '08:30 - 10:00',
    '10:15 - 11:45',
    '12:00 - 13:30',
    '14:00 - 15:30',
    '15:45 - 17:15'
  ];

  const handleAddPair = (e: React.FormEvent) => {
    e.preventDefault();
    const newPair: ScheduleItem = {
      id: `sch-${Date.now()}`,
      dayIndex: pairDay,
      title: pairSubject,
      type: pairType,
      time: pairTime,
      room: pairRoom,
      teacher: pairTeacher,
      color: 'blue'
    };

    const updated = [...scheduleItems, newPair];
    onUpdateSchedule(updated);
    localStorage.setItem('study_os_schedule_items', JSON.stringify(updated));
    showToast('Пара успешно добавлена в расписание!', 'success');
    setIsAddPairModalOpen(false);
  };

  const handleDeletePair = (pairId: string) => {
    const updated = scheduleItems.filter(item => item.id !== pairId);
    onUpdateSchedule(updated);
    localStorage.setItem('study_os_schedule_items', JSON.stringify(updated));
    showToast('Пара удалена из расписания', 'success');
  };

  const daySchedule = useMemo(() => {
    return scheduleItems.filter(item => item.dayIndex === selectedDayIndex);
  }, [scheduleItems, selectedDayIndex]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all animate-bounce ${
          toastMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F3EF] tracking-tight">
                Панель управления администратора
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#8E95A2] mt-1">
              Управление участниками, добавление предметов, преподавателей и редактирование расписания группы 37В
            </p>
          </div>
        </div>

        {/* Database Status indicator */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {hasSupabase ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Supabase Online (Синхронизировано)
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Локальный режим
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8E95A2] mb-1">
            <span className="text-xs font-medium">Участников</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">{usersList.length}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">Включая студентов и преподавателей</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8E95A2] mb-1">
            <span className="text-xs font-medium">Предметов</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">{allSubjects.length}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">В учебном плане 37В</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8E95A2] mb-1">
            <span className="text-xs font-medium">Преподавателей</span>
            <GraduationCap className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">{teachersList.length}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">ЦК колледжа</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
          <div className="flex items-center justify-between text-[#6B7280] dark:text-[#8E95A2] mb-1">
            <span className="text-xs font-medium">Пар в расписании</span>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-[#111827] dark:text-[#F3F3EF]">{scheduleItems.length}</span>
          <span className="text-[11px] text-gray-400 block mt-0.5">Активные занятия на неделю</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#262A32] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] shadow-xs'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Участники сайта ({usersList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'subjects'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] shadow-xs'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Предметы ({allSubjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] shadow-xs'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Преподаватели ({teachersList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] shadow-xs'
              : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F3EF]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Расписание ({scheduleItems.length})</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: УЧАСТНИКИ САЙТА (С УДАЛЕНИЕМ В 1 КЛИК С ПОДТВЕРЖДЕНИЕМ)
          ===================================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Поиск по ФИО, email или группе..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#181B21] p-1 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  userRoleFilter === 'all'
                    ? 'bg-white dark:bg-[#252B35] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Все ({usersList.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('student')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  userRoleFilter === 'student'
                    ? 'bg-white dark:bg-[#252B35] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Студенты
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('teacher')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  userRoleFilter === 'teacher'
                    ? 'bg-white dark:bg-[#252B35] text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Преподаватели
              </button>
            </div>
          </div>

          {/* Users Table / List */}
          <div className="rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs overflow-hidden">
            {isLoadingUsers ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs text-gray-500">Загрузка списка участников...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-xs">
                Участники не найдены.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#181B21]/50 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Участник</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Роль</th>
                      <th className="py-3 px-4">Группа / Курс</th>
                      <th className="py-3 px-4 text-right">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredUsers.map(user => {
                      const isSelf = user.id === currentUser.id || isSuperAdminEmail(user.email, user.name);
                      return (
                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-[#181B21]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                user.role === 'admin'
                                  ? 'bg-rose-600'
                                  : user.role === 'teacher'
                                  ? 'bg-indigo-600'
                                  : 'bg-[#2563EB]'
                              }`}>
                                {user.name ? user.name.slice(0, 2).toUpperCase() : 'УЧ'}
                              </div>
                              <div>
                                <span className="font-semibold text-[#111827] dark:text-[#F3F3EF] block">
                                  {user.name || 'Без имени'}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                    (Вы / Текущий администратор)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400 text-xs">
                            {user.email || '—'}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              user.role === 'admin'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                                : user.role === 'teacher'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            }`}>
                              {user.role === 'admin' ? 'Администратор' : user.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {user.group || '37В'} • {user.course || 3} курс
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => setUserToDelete(user)}
                              title={isSelf ? 'Нельзя удалить текущего администратора' : 'Удалить участника из базы данных'}
                              className={`p-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed text-gray-400'
                                  : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/60'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Удалить</span>
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
        </div>
      )}

      {/* =====================================================================
          TAB 2: ПРЕДМЕТЫ (РУЧНОЕ ДОБАВЛЕНИЕ НОВЫХ ПРЕДМЕТОВ)
          ===================================================================== */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Учебные предметы группы 37В ({allSubjects.length})
            </h2>
            <button
              type="button"
              onClick={() => setIsAddSubjectModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить предмет</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSubjects.map(subj => {
              const isCustom = subj.id.startsWith('custom-subj-');
              return (
                <div 
                  key={subj.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-xs shrink-0">
                          {subj.code || 'ПР'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF] leading-snug">
                            {subj.title}
                          </h3>
                          <span className="text-[11px] text-gray-400">
                            Код: {subj.code} • {subj.group} ({subj.course} курс)
                          </span>
                        </div>
                      </div>

                      {isCustom && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Добавлен вручную
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {subj.subtitle || subj.department}
                    </p>

                    <div className="pt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-gray-400 text-[11px] block">Преподаватель:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{subj.teacher}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[11px] block">Всего часов:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{subj.totalHours} ч.</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[11px] block">Тем в программе:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{subj.topics.length} тем</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Теория: {subj.theoryHours} ч. • Практика: {subj.practiceHours} ч.
                    </span>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => setSubjectToDelete(subj)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Удалить предмет</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: ПРЕПОДАВАТЕЛИ (ДОБАВЛЕНИЕ И ЗАКРЕПЛЕНИЕ ПРЕДМЕТОВ)
          ===================================================================== */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
              Преподавательский состав колледжа ({teachersList.length})
            </h2>
            <button
              type="button"
              onClick={() => setIsAddTeacherModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить преподавателя</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachersList.map(teacher => {
              return (
                <div 
                  key={teacher.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                          {teacher.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{teacher.department}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTeacherToDelete(teacher)}
                      title="Удалить преподавателя"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-mono">{teacher.email}</span>
                    </div>
                    {teacher.room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{teacher.room}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                    <span className="text-[11px] font-semibold text-gray-500 block">Закрепленные дисциплины:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map(sId => {
                          const subj = allSubjects.find(s => s.id === sId || s.code === sId);
                          return (
                            <span 
                              key={sId}
                              className="px-2 py-0.5 rounded-md text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                            >
                              {subj ? subj.shortTitle || subj.code || subj.title : sId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">Все специальные предметы группы 37В</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: РАСПИСАНИЕ (БЫСТРОЕ ДОБАВЛЕНИЕ И РЕДАКТИРОВАНИЕ ПАР)
          ===================================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                Управление расписанием занятий группы 37В
              </h2>
              <p className="text-xs text-gray-500">Добавление, перестановка и удаление пар по дням недели</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPairDay(selectedDayIndex);
                setIsAddPairModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить пару в расписание</span>
            </button>
          </div>

          {/* Days Selector */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {DAYS.map((dayName, idx) => {
              const count = scheduleItems.filter(i => i.dayIndex === idx).length;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedDayIndex === idx
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15181E] text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{dayName}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">{count} {count === 1 ? 'пара' : count > 1 && count < 5 ? 'пары' : 'пар'}</span>
                </button>
              );
            })}
          </div>

          {/* Schedule for the selected day */}
          <div className="rounded-2xl bg-white dark:bg-[#15181E] border border-[#E5E7EB] dark:border-[#262A32] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                Расписание на {DAYS[selectedDayIndex]}
              </span>
              <span className="text-xs text-gray-400">
                {daySchedule.length === 0 ? 'Занятий нет' : `${daySchedule.length} занятий`}
              </span>
            </div>

            {daySchedule.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto" />
                <p className="text-xs text-gray-500">На этот день пары пока не добавлены.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPairDay(selectedDayIndex);
                    setIsAddPairModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить первую пару</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {daySchedule.map(pair => (
                  <div
                    key={pair.id}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#181B21]/50 flex items-center justify-between gap-3 hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 py-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold text-center shrink-0">
                        {pair.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-[#111827] dark:text-[#F3F3EF]">
                            {pair.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {pair.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {pair.room}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-gray-400" />
                            {pair.teacher}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePair(pair.id)}
                      title="Удалить пару"
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЯ ИЗ БАЗЫ ДАННЫХ
          ===================================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Удаление участника
                </h3>
                <span className="text-xs text-gray-500">Безвозвратное действие</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Вы уверены, что хотите удалить пользователя <strong className="text-gray-900 dark:text-white">{userToDelete.name}</strong> ({userToDelete.email})?
            </p>

            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <span className="font-semibold block">Внимание:</span>
              <p>
                Пользователь будет удалён из локального реестра и облачной базы данных Supabase. Все оценки за тесты и сданные практические работы будут стёрты без возможности восстановления.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Удаление...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Да, удалить из базы данных</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ДОБАВЛЕНИЕ НОВОГО ПРЕДМЕТА
          ===================================================================== */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Добавление нового предмета в программу
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Полное название дисциплины:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Архитектура вычислительных систем"
                  value={newSubjTitle}
                  onChange={e => setNewSubjTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Код / Сокращение:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: АВС"
                    value={newSubjCode}
                    onChange={e => setNewSubjCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Преподаватель:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Селедцов А.И."
                    value={newSubjTeacher}
                    onChange={e => setNewSubjTeacher(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Всего часов:
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={newSubjTotalHours}
                    onChange={e => setNewSubjTotalHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Теория (ч):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={newSubjTheoryHours}
                    onChange={e => setNewSubjTheoryHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Практика (ч):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={newSubjPracticeHours}
                    onChange={e => setNewSubjPracticeHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Название вводной темы (Тема 1.1):
                </label>
                <input
                  type="text"
                  placeholder="Введение в дисциплину, цели и задачи курса"
                  value={newSubjIntroTopic}
                  onChange={e => setNewSubjIntroTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать дисциплину</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ДОБАВЛЕНИЕ ПРЕПОДАВАТЕЛЯ
          ===================================================================== */}
      {isAddTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Добавление преподавателя
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTeacherModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  ФИО преподавателя:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Иванов Петр Сергеевич"
                  value={newTeacherName}
                  onChange={e => setNewTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Рабочий Email:
                </label>
                <input
                  type="email"
                  placeholder="p.ivanov@lidacollege.by"
                  value={newTeacherEmail}
                  onChange={e => setNewTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Цикловая комиссия:
                  </label>
                  <input
                    type="text"
                    value={newTeacherDept}
                    onChange={e => setNewTeacherDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Кабинет:
                  </label>
                  <input
                    type="text"
                    value={newTeacherRoom}
                    onChange={e => setNewTeacherRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ДОБАВЛЕНИЕ ПАРЫ В РАСПИСАНИЕ
          ===================================================================== */}
      {isAddPairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Добавить пару в расписание
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPairModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPair} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  День недели:
                </label>
                <select
                  value={pairDay}
                  onChange={e => setPairDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Время пары:
                  </label>
                  <select
                    value={pairTime}
                    onChange={e => setPairTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-mono"
                  >
                    {TIME_SLOTS.map((t, i) => (
                      <option key={i} value={t}>{i + 1} пара ({t})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Тип занятия:
                  </label>
                  <select
                    value={pairType}
                    onChange={e => setPairType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Лекция">Лекция</option>
                    <option value="Практическое занятие">Практика</option>
                    <option value="Лабораторная работа">Лаб. работа</option>
                    <option value="Контрольная работа / ОКР">ОКР</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Предмет:
                </label>
                <select
                  value={pairSubject}
                  onChange={e => setPairSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {allSubjects.map(s => (
                    <option key={s.id} value={s.title}>{s.title} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Аудитория:
                  </label>
                  <input
                    type="text"
                    value={pairRoom}
                    onChange={e => setPairRoom(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Преподаватель:
                  </label>
                  <input
                    type="text"
                    value={pairTeacher}
                    onChange={e => setPairTeacher(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-[#181B21] border border-gray-200 dark:border-gray-800 text-[#111827] dark:text-[#F3F3EF] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAddPairModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить пару</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Subject Deletion */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Удаление дисциплины
                </h3>
                <span className="text-xs text-gray-500">Удаление добавленного предмета</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Вы действительно хотите удалить предмет <strong className="text-gray-900 dark:text-white">{subjectToDelete.title}</strong>? Он исчезнет из расписания, древа тем и журнала оценок.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить предмет</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Teacher Deletion */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#15181E] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F3EF]">
                  Удаление преподавателя
                </h3>
                <span className="text-xs text-gray-500">Удаление профиля</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Вы действительно хотите удалить преподавателя <strong className="text-gray-900 dark:text-white">{teacherToDelete.name}</strong> ({teacherToDelete.email})?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTeacher}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить преподавателя</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
