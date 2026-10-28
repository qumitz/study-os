export type TopicStatus = 'completed' | 'in_progress' | 'locked';

export type ThemeMode = 'light' | 'dark';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicTest {
  id: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
  maxScore: number; // 10-point scale for Belarus college
}

export interface Topic {
  id: string;
  code: string; // e.g. "1.1", "1.2"
  title: string;
  hours: number;
  sectionId: string;
  shortDescription: string;
  synopsis: {
    summary: string;
    keyPoints: string[];
    content: string; // Markdown or rich text
    intuitSourceRef?: string;
  };
  test?: TopicTest;
  practicalWorkRef?: number; // 1, 2, 3, 4
  isExam?: boolean; // ОКР
  prerequisites: string[]; // topic IDs required before unlocking
  position: { x: number; y: number }; // For Skill Tree canvas
}

export interface Section {
  id: string;
  romanNum: string;
  title: string;
  hours: number;
  practiceHours: number;
  topicIds: string[];
}

export interface PracticalWork {
  id: number;
  number: number;
  title: string;
  hours: number;
  goals: string;
  tasks: string[];
  sampleReport: string;
}

export interface Subject {
  id: string;
  title: string;
  shortTitle?: string;
  code: string;
  subtitle: string;
  department: string;
  teacher: string;
  group: string;
  course: number;
  totalHours: number;
  theoryHours: number;
  practiceHours: number;
  sections: Section[];
  topics: Topic[];
  practicalWorks: PracticalWork[];
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  group: string; // e.g. "37В"
  course: number;
  avatar?: string;
  needsOnboarding?: boolean;
}

export interface CollegeGroup {
  id: string;
  name: string;
  course: number;
  specialty: string;
  subjectIds: string[];
}

export interface StudentGradeRecord {
  studentId: string;
  studentName: string;
  group: string;
  topicGrades: Record<string, number | null>; // topicId -> score 1-10 or null
  practicalStatuses: Record<number, 'submitted' | 'graded' | 'not_submitted'>;
  averageScore: number;
  subjectGrades?: Record<string, Record<string, number | null>>; // subjectId -> (topicId | workId) -> score 1-10
  subjectAverages?: Record<string, number>; // subjectId -> average score
  teacherNotes?: Record<string, string>; // subjectId -> optional note
}

export interface StudentProgress {
  topicStatuses: Record<string, TopicStatus>; // topicId -> status
  grades: Record<string, { score: number; completedAt: string; answers?: number[] }>; // topicId -> grade info
}
