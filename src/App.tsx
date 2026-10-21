import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SubjectDetail } from './components/SubjectDetail';
import { ScheduleView } from './components/ScheduleView';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AuthModal } from './components/AuthModal';
import { SettingsView } from './components/SettingsView';
import { MobileNav } from './components/MobileNav';
import { allSubjects, getSubjectById, defaultSubjectId } from './data/allSubjects';
import { initialUsers } from './data/mockData';
import { StudentProgress, TopicStatus, User, UserRole, Topic, Subject } from './types';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('study_os_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('study_os_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('study_os_theme', 'light');
    }
  }, [isDarkMode]);

  // User & Authentication state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('study_os_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    }
    return initialUsers.student;
  });

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Active subject selection
  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    const saved = localStorage.getItem('study_os_active_subject_id');
    return saved || defaultSubjectId;
  });

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

  // Student progress state across all subjects
  const [allProgress, setAllProgress] = useState<Record<string, StudentProgress>>(() => {
    const result: Record<string, StudentProgress> = {};
    allSubjects.forEach((subj) => {
      const key = `study_os_progress_${subj.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          result[subj.id] = JSON.parse(saved);
          return;
        } catch (e) {
          console.error('Failed to parse progress for', subj.id, e);
        }
      }
      
      // Backward compatibility for security subject
      if (subj.id === 'secbasics') {
        const legacy = localStorage.getItem('study_os_progress_37v');
        if (legacy) {
          try {
            result[subj.id] = JSON.parse(legacy);
            return;
          } catch (e) {
            console.error('Failed to parse legacy 37v progress', e);
          }
        }
      }

      // Default initial progress: first topic or topics without prereqs are in_progress
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
  });

  // Current active subject model with any admin overrides applied
  const baseSubject = getSubjectById(activeSubjectId);
  const currentSubject: Subject = {
    ...baseSubject,
    topics: customSubjectTopics[baseSubject.id] || baseSubject.topics
  };

  const currentProgress: StudentProgress = allProgress[currentSubject.id] || {
    topicStatuses: {},
    grades: {}
  };

  // Handle topic completion & auto-unlocking of subsequent branches
  const handleUpdateProgress = (topicId: string, score: number) => {
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

      localStorage.setItem(`study_os_progress_${currentSubject.id}`, JSON.stringify(updatedProgress));
      if (currentSubject.id === 'secbasics') {
        localStorage.setItem('study_os_progress_37v', JSON.stringify(updatedProgress));
      }

      return {
        ...prevAll,
        [currentSubject.id]: updatedProgress
      };
    });
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

  // Role switching
  const handleSwitchRole = (role: UserRole) => {
    const newUser = initialUsers[role] || { ...currentUser, role };
    setCurrentUser(newUser);
    localStorage.setItem('study_os_user', JSON.stringify(newUser));
    if (role === 'teacher') {
      setActiveTab('teacher');
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
    if (user.role === 'teacher') {
      setActiveTab('teacher');
    } else {
      setActiveTab('dashboard');
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-[#FBFBFA] dark:bg-[#0F1115] text-[#111827] dark:text-[#F3F3EF] transition-colors duration-200">
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
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto">
          {currentUser.role === 'teacher' && (activeTab === 'teacher' || (!inSubjectView && activeTab === 'dashboard')) ? (
            <TeacherDashboard
              subject={currentSubject}
              currentUserGroup={currentUser.group}
            />
          ) : inSubjectView || activeTab === 'subjects' ? (
            <SubjectDetail
              subject={currentSubject}
              progress={currentProgress}
              currentUser={currentUser}
              allSubjects={allSubjects}
              onSelectSubject={handleSelectSubject}
              onBack={() => {
                setInSubjectView(false);
                setActiveTab(currentUser.role === 'teacher' ? 'teacher' : 'dashboard');
              }}
              onUpdateProgress={handleUpdateProgress}
              onSaveTopic={handleSaveTopic}
            />
          ) : activeTab === 'schedule' ? (
            <ScheduleView />
          ) : activeTab === 'tests' ? (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <SubjectDetail
                subject={currentSubject}
                progress={currentProgress}
                currentUser={currentUser}
                allSubjects={allSubjects}
                onSelectSubject={handleSelectSubject}
                onBack={() => setActiveTab(currentUser.role === 'teacher' ? 'teacher' : 'dashboard')}
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
            />
          ) : (
            <Dashboard
              subjects={allSubjects}
              allProgress={allProgress}
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
