import { StudentGradeRecord, User, UserRole } from '../types';
import { syncStudentDateGradeToDb } from './supabase';

const STORAGE_PREFIX = 'study_os_students_';
const DELETED_USERS_STORAGE_KEY = 'study_os_deleted_user_identifiers';
const USER_ROLES_STORAGE_KEY = 'study_os_user_assigned_roles';

/**
 * Get all assigned user roles (mapping of normalized ID or email -> UserRole)
 */
export function getAllAssignedRoles(): Record<string, UserRole> {
  try {
    const saved = localStorage.getItem(USER_ROLES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/**
 * Save an assigned role for a user (by ID and optional email)
 */
export function saveUserRole(id: string, role: UserRole, email?: string): void {
  try {
    const roles = getAllAssignedRoles();
    if (id) {
      roles[id.toLowerCase().trim()] = role;
    }
    if (email) {
      roles[email.toLowerCase().trim()] = role;
    }
    localStorage.setItem(USER_ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch (e) {
    console.error('Failed to save user role', e);
  }
}

/**
 * Get an assigned role for a user by ID or email
 */
export function getUserAssignedRole(id?: string, email?: string): UserRole | null {
  if (!id && !email) return null;
  const roles = getAllAssignedRoles();
  if (id && roles[id.toLowerCase().trim()]) {
    return roles[id.toLowerCase().trim()];
  }
  if (email && roles[email.toLowerCase().trim()]) {
    return roles[email.toLowerCase().trim()];
  }
  return null;
}

/**
 * Get all deleted user identifiers (IDs and normalized emails)
 */
export function getDeletedUserIdentifiers(): string[] {
  try {
    const saved = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a user identifier (ID and optional email) as permanently deleted
 */
export function markUserAsDeleted(id: string, email?: string): void {
  try {
    const list = getDeletedUserIdentifiers();
    const additions: string[] = [];
    if (id) additions.push(id.toLowerCase().trim());
    if (email) additions.push(email.toLowerCase().trim());
    const updated = Array.from(new Set([...list, ...additions]));
    localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to mark user as deleted', e);
  }
}

/**
 * Check if a user has been deleted by an administrator
 */
export function isUserDeleted(id?: string, email?: string): boolean {
  if (!id && !email) return false;
  const list = getDeletedUserIdentifiers();
  if (id && list.includes(id.toLowerCase().trim())) return true;
  if (email && list.includes(email.toLowerCase().trim())) return true;
  return false;
}

/**
 * Remove a user from the deleted list (if they are re-registered or re-added)
 */
export function removeUserFromDeleted(id: string, email?: string): void {
  try {
    const list = getDeletedUserIdentifiers();
    const targets: string[] = [];
    if (id) targets.push(id.toLowerCase().trim());
    if (email) targets.push(email.toLowerCase().trim());
    const updated = list.filter(item => !targets.includes(item));
    localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to unmark user as deleted', e);
  }
}

/**
 * Filter out legacy hardcoded mock student records and deleted users
 */
export function sanitizeStudentRecords(records: any[]): StudentGradeRecord[] {
  if (!Array.isArray(records)) return [];
  return records.filter((s): s is StudentGradeRecord => {
    if (!s || typeof s !== 'object') return false;
    const id = String(s.studentId || '');
    // Filter out old hardcoded mock IDs
    if (id.startsWith('st-')) return false;
    if (id === 'usr-student-1' && s.studentName === 'Алексей Иванов') return false;
    if (isUserDeleted(id)) return false;
    return Boolean(s.studentId && s.studentName);
  });
}

/**
 * Get registered students for a group from local storage
 */
export function getRegisteredStudentsForGroup(groupName: string): StudentGradeRecord[] {
  const key = `${STORAGE_PREFIX}${groupName}`;
  const legacyKey = groupName === '37В' ? 'study_os_teacher_grades_37v' : null;

  let records: StudentGradeRecord[] = [];
  const saved = localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
  
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      records = sanitizeStudentRecords(parsed);
      // Clean up legacy storage if it contained sanitized-out mock students
      if (records.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
        localStorage.setItem(key, JSON.stringify(records));
        if (legacyKey) {
          localStorage.setItem(legacyKey, JSON.stringify(records));
        }
      }
    } catch (e) {
      console.error('Failed to parse group students:', e);
    }
  }

  return records;
}

/**
 * Merge local and remote student records without losing data or mock student sanitization
 */
export function mergeStudentRecords(
  localStudents: StudentGradeRecord[], 
  remoteStudents: StudentGradeRecord[]
): StudentGradeRecord[] {
  const sanitizedLocal = sanitizeStudentRecords(localStudents);
  const sanitizedRemote = sanitizeStudentRecords(remoteStudents);
  const map = new Map<string, StudentGradeRecord>();

  sanitizedLocal.forEach(s => {
    if (s && s.studentId) {
      map.set(s.studentId, s);
    }
  });

  sanitizedRemote.forEach(r => {
    if (r && r.studentId) {
      const existing = map.get(r.studentId);
      if (existing) {
        // Deep merge dateGrades across all subjects
        const mergedDateGrades: Record<string, Record<string, number | string | null>> = {};
        const allDateSubjs = new Set([
          ...Object.keys(existing.dateGrades || {}),
          ...Object.keys(r.dateGrades || {})
        ]);
        allDateSubjs.forEach(sId => {
          mergedDateGrades[sId] = {
            ...(existing.dateGrades?.[sId] || {}),
            ...(r.dateGrades?.[sId] || {})
          };
        });

        // Deep merge subjectGrades across all subjects
        const mergedSubjectGrades: Record<string, Record<string, number | null>> = {};
        const allSubjs = new Set([
          ...Object.keys(existing.subjectGrades || {}),
          ...Object.keys(r.subjectGrades || {})
        ]);
        allSubjs.forEach(sId => {
          mergedSubjectGrades[sId] = {
            ...(existing.subjectGrades?.[sId] || {}),
            ...(r.subjectGrades?.[sId] || {})
          };
        });

        // Merge practicalStatuses
        const mergedPracticalStatuses = {
          ...(existing.practicalStatuses || {}),
          ...(r.practicalStatuses || {})
        };

        map.set(r.studentId, {
          ...existing,
          ...r,
          subjectGrades: mergedSubjectGrades,
          subjectAverages: { ...(existing.subjectAverages || {}), ...(r.subjectAverages || {}) },
          topicGrades: { ...(existing.topicGrades || {}), ...(r.topicGrades || {}) },
          dateGrades: mergedDateGrades,
          practicalStatuses: mergedPracticalStatuses,
          averageScore: r.averageScore || existing.averageScore || 0
        });
      } else {
        map.set(r.studentId, r);
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Automatically register or update a student user in their group's journal
 */
export function registerStudentInGroup(user: User): void {
  if (!user || user.role !== 'student' || !user.group || !user.id) return;
  const groupName = user.group;
  const key = `${STORAGE_PREFIX}${groupName}`;

  const currentStudents = getRegisteredStudentsForGroup(groupName);
  const existingIndex = currentStudents.findIndex(
    s => s.studentId === user.id || (user.email && s.studentId === user.email)
  );

  if (existingIndex >= 0) {
    currentStudents[existingIndex].studentName = user.name || currentStudents[existingIndex].studentName;
    currentStudents[existingIndex].group = user.group;
  } else {
    const newRecord: StudentGradeRecord = {
      studentId: user.id,
      studentName: user.name || 'Студент',
      group: user.group,
      topicGrades: {},
      practicalStatuses: { 1: 'not_submitted', 2: 'not_submitted', 3: 'not_submitted', 4: 'not_submitted' },
      averageScore: 0,
      subjectGrades: {},
      subjectAverages: {},
      teacherNotes: {}
    };
    currentStudents.push(newRecord);
  }

  localStorage.setItem(key, JSON.stringify(currentStudents));
  if (groupName === '37В') {
    localStorage.setItem('study_os_teacher_grades_37v', JSON.stringify(currentStudents));
  }
}

/**
 * Save group students to storage
 */
export function saveGroupStudents(groupName: string, students: StudentGradeRecord[]): void {
  const key = `${STORAGE_PREFIX}${groupName}`;
  const sanitized = sanitizeStudentRecords(students);
  localStorage.setItem(key, JSON.stringify(sanitized));
  if (groupName === '37В') {
    localStorage.setItem('study_os_teacher_grades_37v', JSON.stringify(sanitized));
  }
}

/**
 * Automatically record a student's score in their group journal when completing a test
 */
export function updateStudentTopicGrade(
  studentId: string, 
  groupName: string, 
  subjectId: string, 
  topicId: string, 
  score: number,
  topicCode?: string,
  topicTitle?: string,
  answers?: Record<number, number>,
  correctCount?: number,
  totalQuestions?: number
): void {
  const students = getRegisteredStudentsForGroup(groupName);
  const student = students.find(s => s.studentId === studentId);
  if (!student) return;

  if (!student.subjectGrades) student.subjectGrades = {};
  if (!student.subjectGrades[subjectId]) student.subjectGrades[subjectId] = {};
  student.subjectGrades[subjectId][topicId] = score;

  if (subjectId === 'secbasics') {
    if (!student.topicGrades) student.topicGrades = {};
    student.topicGrades[topicId] = score;
  }

  // Also record on today's calendar date in dateGrades
  const todayStr = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  if (!student.dateGrades) student.dateGrades = {};
  if (!student.dateGrades[subjectId]) student.dateGrades[subjectId] = {};
  student.dateGrades[subjectId][todayStr] = score;

  // Record test attempt details
  if (!student.testAttempts) student.testAttempts = {};
  if (!student.testAttempts[subjectId]) student.testAttempts[subjectId] = [];
  student.testAttempts[subjectId].push({
    topicId,
    topicCode,
    topicTitle,
    score,
    completedAt: new Date().toISOString(),
    date: todayStr,
    answers,
    correctCount,
    totalQuestions
  });

  // Recalculate subject average (counting both topic and date grades)
  const topicScores = Object.values(student.subjectGrades[subjectId]).filter(
    (v): v is number => typeof v === 'number' && v > 0
  );
  const dateScores = Object.values(student.dateGrades[subjectId]).filter(
    (v): v is number => typeof v === 'number' && v > 0
  );
  const combinedScores = Array.from(new Set([...topicScores, ...dateScores]));
  const subjAvg = combinedScores.length > 0 
    ? Math.round((combinedScores.reduce((a, b) => a + b, 0) / combinedScores.length) * 10) / 10 
    : score;

  if (!student.subjectAverages) student.subjectAverages = {};
  student.subjectAverages[subjectId] = subjAvg;

  // Recalculate overall GPA
  const allAvgs = Object.values(student.subjectAverages).filter(v => v > 0);
  student.averageScore = allAvgs.length > 0 
    ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10 
    : subjAvg;

  saveGroupStudents(groupName, students);

  // Sync test score to Supabase cloud in real-time
  syncStudentDateGradeToDb(studentId, subjectId, todayStr, score).catch(err => {
    console.warn('Background sync test score warning:', err);
  });
}

/**
 * Set or update a student's grade for a specific calendar date in a subject
 */
export function updateStudentDateGrade(
  studentId: string,
  groupName: string,
  subjectId: string,
  dateStr: string, // 'YYYY-MM-DD'
  grade: number | string | null
): void {
  const students = getRegisteredStudentsForGroup(groupName);
  const student = students.find(s => s.studentId === studentId);
  if (!student) return;

  if (!student.dateGrades) student.dateGrades = {};
  if (!student.dateGrades[subjectId]) student.dateGrades[subjectId] = {};

  if (grade === null || grade === undefined || grade === '') {
    delete student.dateGrades[subjectId][dateStr];
  } else {
    student.dateGrades[subjectId][dateStr] = grade;
  }

  // Recalculate averages based on numerical grades
  const validNumbers = Object.values(student.dateGrades[subjectId]).filter(
    (v): v is number => typeof v === 'number' && v > 0
  );
  
  if (validNumbers.length > 0) {
    const avg = Math.round((validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length) * 10) / 10;
    if (!student.subjectAverages) student.subjectAverages = {};
    student.subjectAverages[subjectId] = avg;

    const allAvgs = Object.values(student.subjectAverages).filter(v => v > 0);
    student.averageScore = allAvgs.length > 0 
      ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10 
      : avg;
  }

  saveGroupStudents(groupName, students);

  // Sync date grade to Supabase cloud in real-time
  syncStudentDateGradeToDb(studentId, subjectId, dateStr, grade).catch(err => {
    console.warn('Background sync date grade warning:', err);
  });
}

/**
 * Helper to get date grades for a student
 */
export function getStudentDateGrades(
  student: StudentGradeRecord,
  subjectId: string
): Record<string, number | string | null> {
  if (student.dateGrades && student.dateGrades[subjectId]) {
    return student.dateGrades[subjectId];
  }
  return {};
}

/**
 * Academic year months: 01.09.2026 - 30.06.2027
 */
export interface AcademicMonth {
  id: string; // '2026-09'
  name: string;
  year: number;
  monthIndex: number; // 0-based for Date
  semester: 1 | 2;
  daysInMonth: number;
}

export const ACADEMIC_MONTHS: AcademicMonth[] = [
  { id: '2026-09', name: 'Сентябрь', year: 2026, monthIndex: 8, semester: 1, daysInMonth: 30 },
  { id: '2026-10', name: 'Октябрь', year: 2026, monthIndex: 9, semester: 1, daysInMonth: 31 },
  { id: '2026-11', name: 'Ноябрь', year: 2026, monthIndex: 10, semester: 1, daysInMonth: 30 },
  { id: '2026-12', name: 'Декабрь', year: 2026, monthIndex: 11, semester: 1, daysInMonth: 31 },
  { id: '2027-01', name: 'Январь', year: 2027, monthIndex: 0, semester: 2, daysInMonth: 31 },
  { id: '2027-02', name: 'Февраль', year: 2027, monthIndex: 1, semester: 2, daysInMonth: 28 },
  { id: '2027-03', name: 'Март', year: 2027, monthIndex: 2, semester: 2, daysInMonth: 31 },
  { id: '2027-04', name: 'Апрель', year: 2027, monthIndex: 3, semester: 2, daysInMonth: 30 },
  { id: '2027-05', name: 'Май', year: 2027, monthIndex: 4, semester: 2, daysInMonth: 31 },
  { id: '2027-06', name: 'Июнь', year: 2027, monthIndex: 5, semester: 2, daysInMonth: 30 },
];

/**
 * Remove a student completely from group registry
 */
export function removeStudentFromRegistry(studentId: string, groupName: string = '37В'): void {
  const students = getRegisteredStudentsForGroup(groupName);
  const updated = students.filter(s => s.studentId !== studentId);
  saveGroupStudents(groupName, updated);
}

