import { PracticalSubmission } from '../types';

const STORAGE_KEY = 'study_os_practical_submissions';

/**
 * Get all practical submissions from localStorage
 */
export function getAllPracticalSubmissions(): PracticalSubmission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse practical submissions:', e);
    return [];
  }
}

/**
 * Save all practical submissions to localStorage
 */
export function saveAllPracticalSubmissions(submissions: PracticalSubmission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save practical submissions:', e);
  }
}

/**
 * Get submissions for a specific student, subject, and work number
 */
export function getStudentPracticalSubmission(
  studentId: string,
  subjectId: string,
  workNumber: number
): PracticalSubmission | null {
  const all = getAllPracticalSubmissions();
  return all.find(
    s => s.studentId === studentId && s.subjectId === subjectId && s.workNumber === workNumber
  ) || null;
}

/**
 * Get all submissions for a group (optionally filtered by subject)
 */
export function getGroupPracticalSubmissions(
  groupName: string,
  subjectId?: string
): PracticalSubmission[] {
  const all = getAllPracticalSubmissions();
  return all.filter(s => {
    const matchGroup = !groupName || s.group === groupName;
    const matchSubj = !subjectId || s.subjectId === subjectId;
    return matchGroup && matchSubj;
  });
}

/**
 * Create or update a student's submission (draft or submitted)
 */
export function savePracticalSubmission(submission: PracticalSubmission): PracticalSubmission {
  const all = getAllPracticalSubmissions();
  const existingIndex = all.findIndex(s => s.id === submission.id);

  const updatedSubmission: PracticalSubmission = {
    ...submission,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    all[existingIndex] = updatedSubmission;
  } else {
    all.push(updatedSubmission);
  }

  saveAllPracticalSubmissions(all);
  return updatedSubmission;
}

/**
 * Teacher grades a practical submission
 */
export function gradePracticalSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
  teacherName: string = 'Селедцов Александр Игоревич'
): PracticalSubmission | null {
  const all = getAllPracticalSubmissions();
  const target = all.find(s => s.id === submissionId);
  if (!target) return null;

  target.grade = grade;
  target.teacherFeedback = feedback;
  target.gradedBy = teacherName;
  target.gradedAt = new Date().toISOString();
  target.status = 'graded';
  target.updatedAt = new Date().toISOString();

  saveAllPracticalSubmissions(all);
  return target;
}

/**
 * Teacher returns submission for revision
 */
export function requestRevisionPracticalSubmission(
  submissionId: string,
  feedback: string,
  teacherName: string = 'Селедцов Александр Игоревич'
): PracticalSubmission | null {
  const all = getAllPracticalSubmissions();
  const target = all.find(s => s.id === submissionId);
  if (!target) return null;

  target.teacherFeedback = feedback;
  target.gradedBy = teacherName;
  target.status = 'needs_revision';
  target.updatedAt = new Date().toISOString();

  saveAllPracticalSubmissions(all);
  return target;
}

/**
 * Delete a submission
 */
export function deletePracticalSubmission(submissionId: string): void {
  const all = getAllPracticalSubmissions();
  const filtered = all.filter(s => s.id !== submissionId);
  saveAllPracticalSubmissions(filtered);
}
