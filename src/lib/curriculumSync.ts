import { Subject, Topic, TopicStatus, StudentProgress, User } from '../types';
import { getRegisteredStudentsForGroup, updateStudentTopicGrade } from './studentRegistry';
import { getAvailableGroups } from './groupRegistry';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface GroupCurriculumCheckpoint {
  groupName: string;
  subjectId: string;
  targetTopicId: string;
  targetTopicCode: string;
  targetTopicTitle: string;
  completedTopicIds: string[];
  setBy?: string;
  updatedAt: string;
  defaultScore?: number;
}

const CHECKPOINT_STORAGE_PREFIX = 'study_os_group_checkpoint_';

/**
 * Get the current curriculum checkpoint for a group and subject
 */
export function getGroupCheckpoint(groupName: string, subjectId: string): GroupCurriculumCheckpoint | null {
  try {
    const key = `${CHECKPOINT_STORAGE_PREFIX}${groupName}_${subjectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse group checkpoint', e);
  }
  return null;
}

/**
 * Save a curriculum checkpoint for a group and subject
 */
export function saveGroupCheckpoint(checkpoint: GroupCurriculumCheckpoint): void {
  try {
    const key = `${CHECKPOINT_STORAGE_PREFIX}${checkpoint.groupName}_${checkpoint.subjectId}`;
    localStorage.setItem(key, JSON.stringify(checkpoint));
  } catch (e) {
    console.error('Failed to save group checkpoint', e);
  }
}

/**
 * Get all saved curriculum checkpoints for a group (or all groups)
 */
export function getAllGroupCheckpoints(groupName?: string): GroupCurriculumCheckpoint[] {
  const checkpoints: GroupCurriculumCheckpoint[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CHECKPOINT_STORAGE_PREFIX)) {
        if (!groupName || key.startsWith(`${CHECKPOINT_STORAGE_PREFIX}${groupName}_`)) {
          const val = localStorage.getItem(key);
          if (val) {
            checkpoints.push(JSON.parse(val));
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to list group checkpoints', e);
  }
  return checkpoints;
}

/**
 * Split subject topics into preceding, target, and subsequent topics based on targetTopicId
 */
export function computeCurriculumFastForward(
  subject: Subject, 
  targetTopicId: string
): {
  precedingTopics: Topic[];
  targetTopic: Topic | null;
  subsequentTopics: Topic[];
} {
  const topics = subject.topics || [];
  const targetIndex = topics.findIndex(t => t.id === targetTopicId);

  if (targetIndex < 0) {
    return {
      precedingTopics: [],
      targetTopic: null,
      subsequentTopics: topics
    };
  }

  const precedingTopics = topics.slice(0, targetIndex);
  const targetTopic = topics[targetIndex];
  const subsequentTopics = topics.slice(targetIndex + 1);

  return {
    precedingTopics,
    targetTopic,
    subsequentTopics
  };
}

export interface FastForwardParams {
  groupName: string; // e.g. "37В" or "Все группы"
  subject: Subject;
  targetTopicId: string;
  teacherName?: string;
  assignGrades?: boolean;
  defaultScore?: number;
}

/**
 * Fast-forwards progress for all students of a group up to the chosen target topic.
 * All preceding topics are automatically marked as 'completed'.
 * The target topic becomes active ('in_progress').
 */
export async function fastForwardGroupCurriculum({
  groupName,
  subject,
  targetTopicId,
  teacherName = 'Преподаватель',
  assignGrades = false,
  defaultScore = 8
}: FastForwardParams): Promise<{ success: boolean; affectedStudentsCount: number; completedCount: number }> {
  const { precedingTopics, targetTopic, subsequentTopics } = computeCurriculumFastForward(subject, targetTopicId);

  if (!targetTopic) {
    return { success: false, affectedStudentsCount: 0, completedCount: 0 };
  }

  const completedTopicIds = precedingTopics.map(t => t.id);

  // 1. Determine target group names
  const targetGroups = groupName === 'Все группы'
    ? getAvailableGroups().map(g => g.name)
    : [groupName];

  // 2. Save group checkpoints for each affected group
  targetGroups.forEach(grp => {
    const checkpoint: GroupCurriculumCheckpoint = {
      groupName: grp,
      subjectId: subject.id,
      targetTopicId,
      targetTopicCode: targetTopic.code,
      targetTopicTitle: targetTopic.title,
      completedTopicIds,
      setBy: teacherName,
      updatedAt: new Date().toISOString(),
      defaultScore: assignGrades ? defaultScore : undefined
    };
    saveGroupCheckpoint(checkpoint);
  });

  // 3. Collect local students from target groups
  const affectedStudentIds = new Set<string>();
  targetGroups.forEach(grp => {
    const students = getRegisteredStudentsForGroup(grp);
    students.forEach(s => affectedStudentIds.add(s.studentId));
  });

  // 4. Update localStorage progress for all existing local students
  affectedStudentIds.forEach(studentId => {
    const storageKey = `study_os_progress_${studentId}_${subject.id}`;
    let studentProg: StudentProgress = { topicStatuses: {}, grades: {} };
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        studentProg = JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    const nextStatuses = { ...studentProg.topicStatuses };
    const nextGrades = { ...studentProg.grades };

    // Mark all preceding as completed
    precedingTopics.forEach(t => {
      nextStatuses[t.id] = 'completed';
      if (assignGrades && !nextGrades[t.id]) {
        nextGrades[t.id] = {
          score: defaultScore,
          completedAt: new Date().toLocaleDateString('ru-RU')
        };
      }
    });

    // Mark target topic as in_progress (if not already completed)
    if (nextStatuses[targetTopicId] !== 'completed') {
      nextStatuses[targetTopicId] = 'in_progress';
    }

    // Subsequent topics remain locked unless already completed
    subsequentTopics.forEach(t => {
      if (!nextStatuses[t.id]) {
        nextStatuses[t.id] = 'locked';
      }
    });

    const updatedProg: StudentProgress = {
      topicStatuses: nextStatuses,
      grades: nextGrades
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedProg));

    // If teacher opted to assign default scores directly into the student journal:
    if (assignGrades) {
      targetGroups.forEach(grp => {
        precedingTopics.forEach(t => {
          updateStudentTopicGrade(
            studentId,
            grp,
            subject.id,
            t.id,
            defaultScore,
            t.code,
            t.title
          );
        });
      });
    }
  });

  // 5. Update Supabase if configured
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from('profiles').select('id, group_name').eq('role', 'student');
        if (groupName !== 'Все группы') {
          query = query.eq('group_name', groupName);
        }
        const { data: dbStudents } = await query;
        if (dbStudents && dbStudents.length > 0) {
          for (const s of dbStudents) {
            affectedStudentIds.add(s.id);

            // Fetch existing progress row
            const { data: progRow } = await client
              .from('student_progress')
              .select('topic_statuses, grades')
              .eq('user_id', s.id)
              .eq('subject_id', subject.id)
              .maybeSingle();

            const existingStatuses = (progRow?.topic_statuses as Record<string, TopicStatus>) || {};
            const existingGrades = (progRow?.grades as Record<string, any>) || {};

            const nextStatuses = { ...existingStatuses };
            const nextGrades = { ...existingGrades };

            precedingTopics.forEach(t => {
              nextStatuses[t.id] = 'completed';
              if (assignGrades && !nextGrades[t.id]) {
                nextGrades[t.id] = {
                  score: defaultScore,
                  completedAt: new Date().toLocaleDateString('ru-RU')
                };
              }
            });

            if (nextStatuses[targetTopicId] !== 'completed') {
              nextStatuses[targetTopicId] = 'in_progress';
            }

            subsequentTopics.forEach(t => {
              if (!nextStatuses[t.id]) {
                nextStatuses[t.id] = 'locked';
              }
            });

            await client.from('student_progress').upsert({
              user_id: s.id,
              subject_id: subject.id,
              topic_statuses: nextStatuses,
              grades: nextGrades,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,subject_id' });
          }
        }
      } catch (err) {
        console.warn('Failed to sync fast-forward progress to Supabase:', err);
      }
    }
  }

  // 6. Broadcast event so currently mounted views can re-render immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('study_os_progress_updated', {
      detail: { subjectId: subject.id, groupName, targetTopicId }
    }));
  }

  return {
    success: true,
    affectedStudentsCount: affectedStudentIds.size,
    completedCount: precedingTopics.length
  };
}

/**
 * Checks if there is a group curriculum checkpoint and applies it to a student's progress
 * if their progress is behind the checkpoint.
 */
export function applyGroupCheckpointsToProgress(
  groupName: string,
  subject: Subject,
  currentProgress: StudentProgress
): StudentProgress {
  if (!groupName || !subject) return currentProgress;

  const checkpoint = getGroupCheckpoint(groupName, subject.id);
  if (!checkpoint || !checkpoint.completedTopicIds || checkpoint.completedTopicIds.length === 0) {
    return currentProgress;
  }

  let hasChanges = false;
  const newStatuses = { ...currentProgress.topicStatuses };
  const newGrades = { ...currentProgress.grades };

  // Mark all checkpoint topics as completed if they aren't already
  checkpoint.completedTopicIds.forEach(topicId => {
    if (newStatuses[topicId] !== 'completed') {
      newStatuses[topicId] = 'completed';
      if (checkpoint.defaultScore && !newGrades[topicId]) {
        newGrades[topicId] = {
          score: checkpoint.defaultScore,
          completedAt: new Date(checkpoint.updatedAt).toLocaleDateString('ru-RU')
        };
      }
      hasChanges = true;
    }
  });

  // Ensure target topic is at least in_progress (if not completed)
  if (checkpoint.targetTopicId && newStatuses[checkpoint.targetTopicId] !== 'completed') {
    if (newStatuses[checkpoint.targetTopicId] !== 'in_progress') {
      newStatuses[checkpoint.targetTopicId] = 'in_progress';
      hasChanges = true;
    }
  }

  if (hasChanges) {
    return {
      topicStatuses: newStatuses,
      grades: newGrades
    };
  }

  return currentProgress;
}
