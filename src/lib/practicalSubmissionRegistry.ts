import { PracticalSubmission } from '../types';
import { 
  syncPracticalSubmissionToDb, 
  fetchGroupPracticalSubmissionsFromDb,
  fetchStudentPracticalSubmissionsFromDb 
} from './supabase';

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
 * Merges remote submissions from Supabase with local submissions,
 * preserving whichever version has the latest updatedAt.
 */
export function mergeRemoteSubmissions(remoteList: PracticalSubmission[]): PracticalSubmission[] {
  if (!Array.isArray(remoteList) || remoteList.length === 0) {
    return getAllPracticalSubmissions();
  }

  const localList = getAllPracticalSubmissions();
  const map = new Map<string, PracticalSubmission>();

  localList.forEach(s => map.set(s.id, s));

  remoteList.forEach(rem => {
    if (!rem || !rem.id) return;
    const loc = map.get(rem.id);
    if (!loc) {
      map.set(rem.id, rem);
    } else {
      const locTime = new Date(loc.updatedAt || loc.submittedAt || 0).getTime();
      const remTime = new Date(rem.updatedAt || rem.submittedAt || 0).getTime();
      if (remTime >= locTime) {
        map.set(rem.id, rem);
      }
    }
  });

  const merged = Array.from(map.values());
  saveAllPracticalSubmissions(merged);
  return merged;
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
    const matchGroup = !groupName || groupName === 'Все группы' || s.group === groupName;
    const matchSubj = !subjectId || s.subjectId === subjectId;
    return matchGroup && matchSubj;
  });
}

/**
 * Create or update a student's submission (draft or submitted)
 * Saves locally immediately, then syncs to Supabase cloud.
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

  // Sync to Supabase in background
  syncPracticalSubmissionToDb(updatedSubmission).catch(err => {
    console.warn('Background practical sync warning:', err);
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('study_os_practical_submissions_updated', {
      detail: { submission: updatedSubmission }
    }));
  }

  return updatedSubmission;
}

/**
 * Teacher grades a practical submission
 * Updates locally immediately, then syncs to Supabase cloud.
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

  // Sync to Supabase cloud
  syncPracticalSubmissionToDb(target).catch(err => {
    console.warn('Background practical grade sync warning:', err);
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('study_os_practical_submissions_updated', {
      detail: { submission: target }
    }));
  }

  return target;
}

/**
 * Teacher returns submission for revision
 * Updates locally immediately, then syncs to Supabase cloud.
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

  // Sync to Supabase cloud
  syncPracticalSubmissionToDb(target).catch(err => {
    console.warn('Background practical revision sync warning:', err);
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('study_os_practical_submissions_updated', {
      detail: { submission: target }
    }));
  }

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
