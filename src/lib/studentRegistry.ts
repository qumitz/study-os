import { StudentGradeRecord, User } from '../types';

const STORAGE_PREFIX = 'study_os_students_';

/**
 * Filter out legacy hardcoded mock student records
 */
export function sanitizeStudentRecords(records: any[]): StudentGradeRecord[] {
  if (!Array.isArray(records)) return [];
  return records.filter((s): s is StudentGradeRecord => {
    if (!s || typeof s !== 'object') return false;
    const id = String(s.studentId || '');
    // Filter out old hardcoded mock IDs
    if (id.startsWith('st-')) return false;
    if (id === 'usr-student-1' && s.studentName === 'Алексей Иванов') return false;
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
        map.set(r.studentId, {
          ...existing,
          ...r,
          subjectGrades: { ...(existing.subjectGrades || {}), ...(r.subjectGrades || {}) },
          subjectAverages: { ...(existing.subjectAverages || {}), ...(r.subjectAverages || {}) },
          topicGrades: { ...(existing.topicGrades || {}), ...(r.topicGrades || {}) }
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
  score: number
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

  // Recalculate subject average
  const validScores = Object.values(student.subjectGrades[subjectId]).filter(
    (v): v is number => typeof v === 'number' && v > 0
  );
  const subjAvg = validScores.length > 0 
    ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 
    : score;

  if (!student.subjectAverages) student.subjectAverages = {};
  student.subjectAverages[subjectId] = subjAvg;

  // Recalculate overall GPA
  const allAvgs = Object.values(student.subjectAverages).filter(v => v > 0);
  student.averageScore = allAvgs.length > 0 
    ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10 
    : subjAvg;

  saveGroupStudents(groupName, students);
}

/**
 * Remove a student completely from group registry
 */
export function removeStudentFromRegistry(studentId: string, groupName: string = '37В'): void {
  const students = getRegisteredStudentsForGroup(groupName);
  const updated = students.filter(s => s.studentId !== studentId);
  saveGroupStudents(groupName, updated);
}

