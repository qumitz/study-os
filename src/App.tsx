import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubjectDetail } from './components/SubjectDetail';
import { ScheduleView } from './components/ScheduleView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsView } from './components/SettingsView';
import { MobileNav } from './components/MobileNav';
import { allSubjects, getSubjectById, defaultSubjectId } from './data/allSubjects';
import { StudentProgress, TopicStatus, User, UserRole, Topic, Subject, ThemeMode, ScheduleItem } from './types';
import { 
  getSupabaseClient, 
  isSupabaseConfigured, 
  fetchProfile, 
  syncUserSession,
  upsertProfile,
  fetchStudentProgressFromDb, 
  fetchAllUserProgressFromDb,
  syncProgressToDb, 
  signOutFromSupabase,
  isSuperAdminEmail 
} from './lib/supabase';
import { registerStudentInGroup, updateStudentTopicGrade } from './lib/studentRegistry';

export const defaultGuestUser: User = {
  id: '',
  name: 'Гость',
  email: '',
  role: 'student',
  group: '37В',
  course: 3
};

export default function App() {
  // 1. Color theme: light or dark (100% preserves original themes)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('study_os_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('study_os_theme', isDarkMode ? 'dark' : 'light');

    // Theme: dark / light
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // User & Authentication state (real Supabase profile or guest)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('study_os_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean out legacy mock test profiles
        if (parsed.id === 'usr-student-1' || parsed.email === 'a.ivanov@student.lidacollege.by') {
          localStorage.removeItem('study_os_user');
          return defaultGuestUser;
        }
        if (isSuperAdminEmail(parsed.email, parsed.name)) {
          parsed.role = parsed.role || 'admin';
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }
    return defaultGuestUser;
  });

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Automatically register student user in their group journal whenever user state updates
  useEffect(() => {
    if (currentUser?.id && currentUser.role === 'student' && currentUser.group) {
      registerStudentInGroup(currentUser);
    }
  }, [currentUser]);

  // Supabase Auth listener (Google OAuth & Email session sync)
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    // Check active session on startup
    client.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await syncUserSession(session.user);
        setCurrentUser(profile);
        localStorage.setItem('study_os_user', JSON.stringify(profile));
        if (profile.role === 'student') {
          registerStudentInGroup(profile);
        }
      } else {
        const saved = localStorage.getItem('study_os_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.id === 'usr-student-1') {
              localStorage.removeItem('study_os_user');
              setCurrentUser(defaultGuestUser);
            }
          } catch (e) {}
        }
      }
    });

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        const profile = await syncUserSession(session.user);
        setCurrentUser(profile);
        localStorage.setItem('study_os_user', JSON.stringify(profile));
        if (profile.role === 'student') {
          registerStudentInGroup(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(defaultGuestUser);
        localStorage.removeItem('study_os_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Active subject selection
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    const saved = localStorage.getItem('study_os_active_subject_id');
    return saved || defaultSubjectId;
  });

  // Admin custom subjects state (stored in localStorage)
  const [customSubjects, setCustomSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem('study_os_custom_subjects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse custom subjects', e);
      return [];
    }
  });

  // Combined subjects: official college subjects + custom admin subjects
  const subjects = useMemo(() => {
    return [...allSubjects, ...customSubjects];
  }, [customSubjects]);

  // Schedule items state
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem('study_os_schedule_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const handleUpdateSchedule = (newItems: ScheduleItem[]) => {
    setScheduleItems(newItems);
    localStorage.setItem('study_os_schedule_items', JSON.stringify(newItems));
  };

  const handleAddSubject = (newSubject: Subject) => {
    setCustomSubjects((prev) => {
      const updated = [...prev, newSubject];
      localStorage.setItem('study_os_custom_subjects', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    setCustomSubjects((prev) => {
      const updated = prev.filter((s) => s.id !== subjectId);
      localStorage.setItem('study_os_custom_subjects', JSON.stringify(updated));
      return updated;
    });
    if (activeSubjectId === subjectId) {
      setActiveSubjectId(allSubjects[0]?.id || defaultSubjectId);
    }
  };

  // Admin custom topics state (per-subject)
  const [customSubjectTopics, setCustomSubjectTopics] = useState<Record<string, Topic[]>>(() => {
    const result: Record<string, Topic[]> = {};
    allSubjects.forEach((s) => {
      const saved = localStorage.getItem(`study_os_subject_topics_${s.id}`);
      if (saved) {
        try {
          result[s.id] = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse custom topics for', s.id, e);
        }
      } else if (s.id === 'secbasics') {
        const legacy = localStorage.getItem('study_os_subject_topics');
        if (legacy) {
          try {
            result[s.id] = JSON.parse(legacy);
          } catch (e) {
            console.error('Failed to parse legacy topics', e);
          }
        }
      }
    });
    return result;
  });

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [inSubjectView, setInSubjectView] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Helper to build initial pristine progress per subject
  const buildDefaultProgress = (): Record<string, StudentProgress> => {
    const result: Record<string, StudentProgress> = {};
    subjects.forEach((subj) => {
      const initialStatuses: Record<string, TopicStatus> = {};
      subj.topics.forEach((t, idx) => {
        if (idx === 0 || t.id.includes('intro') || t.prerequisites.length === 0) {
          initialStatuses[t.id] = 'in_progress';
        } else {
          initialStatuses[t.id] = 'locked';
        }
      });
      result[subj.id] = {
        topicStatuses: initialStatuses,
        grades: {}
      };
    });
    return result;
  };

  // Load progress scoped strictly to the authenticated user ID
  const loadUserProgressFromStorage = (userId: string): Record<string, StudentProgress> => {
    const defaultProg = buildDefaultProgress();
    if (!userId) return defaultProg;

    const result: Record<string, StudentProgress> = {};
    subjects.forEach((subj) => {
      const key = `study_os_progress_${userId}_${subj.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          result[subj.id] = JSON.parse(saved);
          return;
        } catch (e) {
          console.error('Failed to parse progress for', subj.id, e);
        }
      }
      result[subj.id] = defaultProg[subj.id] || { topicStatuses: {}, grades: {} };
    });
    return result;
  };

  // Student progress state scoped strictly to the current authenticated account
  const [allProgress, setAllProgress] = useState<Record<string, StudentProgress>>(() => {
    return loadUserProgressFromStorage(currentUser.id);
  });

  // Whenever currentUser changes (sign in with another account, sign out): reload THEIR progress!
  useEffect(() => {
    if (!currentUser.id) {
      setAllProgress(buildDefaultProgress());
      return;
    }

    // 1. Immediately load local progress for this user
    const localProg = loadUserProgressFromStorage(currentUser.id);
    setAllProgress(localProg);

    // 2. Fetch all progress records from Supabase cloud for this specific user
    if (isSupabaseConfigured()) {
      fetchAllUserProgressFromDb(currentUser.id).then((cloudProgress) => {
        if (cloudProgress && Object.keys(cloudProgress).length > 0) {
          setAllProgress((prev) => {
            const merged = { ...prev };
            subjects.forEach((subj) => {
              if (cloudProgress[subj.id] && Object.keys(cloudProgress[subj.id].topicStatuses).length > 0) {
                merged[subj.id] = cloudProgress[subj.id];
                localStorage.setItem(`study_os_progress_${currentUser.id}_${subj.id}`, JSON.stringify(cloudProgress[subj.id]));
              }
            });
            return merged;
          });
        }
      });
    }
  }, [currentUser.id, subjects]);

  // Current active subject model with any admin overrides applied
  const baseSubject = subjects.find(s => s.id === activeSubjectId) || getSubjectById(activeSubjectId) || subjects[0] || allSubjects[0];
  const currentSubject: Subject = {
    ...baseSubject,
    topics: customSubjectTopics[baseSubject.id] || baseSubject.topics
  };

  const currentProgress: StudentProgress = allProgress[currentSubject.id] || {
    topicStatuses: {},
    grades: {}
  };

  // Handle topic completion & auto-unlocking of subsequent branches
  const handleUpdateProgress = (
    topicId: string, 
    score: number,
    answers?: Record<number, number>,
    correctCount?: number,
    totalQuestions?: number
  ) => {
    setAllProgress((prevAll) => {
      const current = prevAll[currentSubject.id] || { topicStatuses: {}, grades: {} };
      const nextStatuses = { ...current.topicStatuses, [topicId]: 'completed' as TopicStatus };
      const nextGrades = {
        ...current.grades,
        [topicId]: {
          score,
          completedAt: new Date().toLocaleDateString('ru-RU')
        }
      };

      // Check which locked topics can now be unlocked
      currentSubject.topics.forEach((topic) => {
        if (nextStatuses[topic.id] === 'locked') {
          const allPrereqsMet = topic.prerequisites.every(
            (prereqId) => nextStatuses[prereqId] === 'completed'
          );
          if (allPrereqsMet) {
            nextStatuses[topic.id] = 'in_progress';
          }
        }
      });

      const updatedProgress: StudentProgress = {
        topicStatuses: nextStatuses,
        grades: nextGrades
      };

      // Save scoped to this user ID
      if (currentUser.id) {
        localStorage.setItem(`study_os_progress_${currentUser.id}_${currentSubject.id}`, JSON.stringify(updatedProgress));
      }

      // Sync to Supabase in background
      if (isSupabaseConfigured() && currentUser?.id) {
        syncProgressToDb(currentUser.id, currentSubject.id, updatedProgress);
      }

      return {
        ...prevAll,
        [currentSubject.id]: updatedProgress
      };
    });

    // Auto-sync into group journal if current user is a student
    if (currentUser?.id && currentUser.role === 'student' && currentUser.group) {
      const topicObj = currentSubject.topics.find(t => t.id === topicId);
      updateStudentTopicGrade(
        currentUser.id,
        currentUser.group,
        currentSubject.id,
        topicId,
        score,
        topicObj?.code,
        topicObj?.title,
        answers,
        correctCount,
        totalQuestions
      );
    }
  };

  // Admin: Save updated topic
  const handleSaveTopic = (updatedTopic: Topic) => {
    setCustomSubjectTopics((prev) => {
      const existing = prev[currentSubject.id] || currentSubject.topics;
      const nextTopics = existing.map((t) => (t.id === updatedTopic.id ? updatedTopic : t));
      localStorage.setItem(`study_os_subject_topics_${currentSubject.id}`, JSON.stringify(nextTopics));
      return {
        ...prev,
        [currentSubject.id]: nextTopics
      };
    });
  };

  // Subject switching
  const handleSelectSubject = (subjectOrId: Subject | string) => {
    const id = typeof subjectOrId === 'string' ? subjectOrId : subjectOrId.id;
    setActiveSubjectId(id);
    localStorage.setItem('study_os_active_subject_id', id);
    setInSubjectView(true);
    setActiveTab('subjects');
  };

  // Role switching: strictly reserved for system administrator
  const handleSwitchRole = (role: UserRole) => {
    const isAllowed = isSuperAdminEmail(currentUser.email, currentUser.name) || currentUser.role === 'admin';
    if (!isAllowed) {
      console.warn('Unauthorized role switch attempt blocked');
      return;
    }

    const newUser: User = { ...currentUser, role };
    setCurrentUser(newUser);
    localStorage.setItem('study_os_user', JSON.stringify(newUser));
    if (role === 'student') {
      registerStudentInGroup(newUser);
    }
    if (isSupabaseConfigured() && newUser.id && !newUser.id.startsWith('usr-guest-')) {
      upsertProfile(newUser);
    }
    if (role === 'teacher') {
      setActiveTab('teacher');
      setInSubjectView(false);
    } else if (role === 'admin') {
      setActiveTab('admin');
      setInSubjectView(false);
    } else {
      setActiveTab('dashboard');
      setInSubjectView(false);
    }
  };

  // Authentication Login
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('study_os_user', JSON.stringify(user));
    if (user.role === 'student') {
      registerStudentInGroup(user);
    }
    if (user.role === 'teacher') {
      setActiveTab('teacher');
    } else if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Profile update (ФИО and details)
  const handleUpdateUser = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('study_os_user', JSON.stringify(updatedUser));
    if (updatedUser.role === 'student') {
      registerStudentInGroup(updatedUser);
    }
    if (isSupabaseConfigured() && updatedUser.id) {
      await upsertProfile(updatedUser);
    }
  };

  // Logout
  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await signOutFromSupabase();
    }
    localStorage.removeItem('study_os_user');
    setCurrentUser(defaultGuestUser);
  };

  // Complete onboarding for OAuth users
  const handleCompleteOnboarding = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('study_os_user', JSON.stringify(updatedUser));
    if (updatedUser.role === 'student') {
      registerStudentInGroup(updatedUser);
    }
    if (isSupabaseConfigured() && updatedUser.id) {
      await upsertProfile(updatedUser);
    }
  };

  // If user is not authenticated, show full-screen Auth Gate
  if (!currentUser.id) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FBFBFA] dark:bg-[#0F1115] text-[#111827] dark:text-[#F3F3EF] transition-colors duration-200 relative overflow-x-hidden">
      {/* Onboarding Modal for new Google sign-ins */}
      {currentUser.needsOnboarding && (
        <OnboardingModal
          user={currentUser}
          onComplete={handleCompleteOnboarding}
          onLogout={handleLogout}
        />
      )}
      {/* Persistent Left Sidebar (Desktop) */}
      <Sidebar
        activeTab={inSubjectView ? 'subjects' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setInSubjectView(tab === 'subjects');
        }}
        currentUser={currentUser}
        groupName={currentUser.group}
        course={currentUser.course}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative z-10">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSuperAdmin={isSuperAdminEmail(currentUser.email, currentUser.name)}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'admin' && (isSuperAdminEmail(currentUser.email, currentUser.name) || currentUser.role === 'admin') ? (
            <AdminPanel
              currentUser={currentUser}
              allSubjects={subjects}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              scheduleItems={scheduleItems}
              onUpdateSchedule={handleUpdateSchedule}
              onSwitchTab={(tab) => {
                setActiveTab(tab as NavTab);
                if (tab === 'subjects') setInSubjectView(true);
              }}
            />
          ) : (activeTab === 'teacher' && (currentUser.role === 'teacher' || currentUser.role === 'admin' || isSuperAdminEmail(currentUser.email, currentUser.name))) || (currentUser.role === 'teacher' && !inSubjectView && activeTab === 'dashboard') ? (
            <TeacherDashboard
              subject={currentSubject}
              currentUserGroup={currentUser.group}
              allSubjects={subjects}
              onSelectSubject={handleSelectSubject}
            />
          ) : inSubjectView || activeTab === 'subjects' ? (
            <SubjectDetail
              subject={currentSubject}
              progress={currentProgress}
              currentUser={currentUser}
              allSubjects={subjects}
              onSelectSubject={handleSelectSubject}
              onBack={() => {
                setInSubjectView(false);
                setActiveTab(currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'dashboard');
              }}
              onUpdateProgress={handleUpdateProgress}
              onSaveTopic={handleSaveTopic}
            />
          ) : activeTab === 'schedule' ? (
            <ScheduleView currentUser={currentUser} allSubjects={subjects} />
          ) : activeTab === 'labs' ? (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <SubjectDetail
                subject={currentSubject}
                progress={currentProgress}
                currentUser={currentUser}
                allSubjects={subjects}
                onSelectSubject={handleSelectSubject}
                onBack={() => setActiveTab(currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                onUpdateProgress={handleUpdateProgress}
                onSaveTopic={handleSaveTopic}
                initialViewMode="practicals"
              />
            </div>
          ) : activeTab === 'tests' ? (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <SubjectDetail
                subject={currentSubject}
                progress={currentProgress}
                currentUser={currentUser}
                allSubjects={subjects}
                onSelectSubject={handleSelectSubject}
                onBack={() => setActiveTab(currentUser.role === 'teacher' ? 'teacher' : currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                onUpdateProgress={handleUpdateProgress}
                onSaveTopic={handleSaveTopic}
              />
            </div>
          ) : activeTab === 'settings' ? (
            <SettingsView
              currentUser={currentUser}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              onOpenAuth={() => setIsAuthOpen(true)}
              onUpdateUser={handleUpdateUser}
              onSwitchRole={handleSwitchRole}
              isSuperAdmin={isSuperAdminEmail(currentUser.email, currentUser.name)}
            />
          ) : (
            <Dashboard
              subjects={subjects}
              allProgress={allProgress}
              currentUser={currentUser}
              onSelectSubject={handleSelectSubject}
              onOpenSubject={() => {
                setInSubjectView(true);
                setActiveTab('subjects');
              }}
              onOpenSchedule={() => setActiveTab('schedule')}
              onOpenTests={() => {
                setInSubjectView(true);
                setActiveTab('subjects');
              }}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav
          activeTab={inSubjectView ? 'subjects' : activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setInSubjectView(tab === 'subjects');
          }}
        />
      </div>

      {/* Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        currentUser={currentUser}
      />
    </div>
  );
}
