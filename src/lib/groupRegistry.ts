import { CollegeGroup } from '../types';
import { availableGroups as defaultGroups } from '../data/mockData';

const GROUPS_STORAGE_KEY = 'study_os_college_groups';

/**
 * Returns all available college groups (default groups + custom created by admin)
 */
export function getAvailableGroups(): CollegeGroup[] {
  try {
    const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (saved) {
      const parsed: CollegeGroup[] = JSON.parse(saved);
      // Ensure default groups are always included
      const mergedMap = new Map<string, CollegeGroup>();
      defaultGroups.forEach(g => mergedMap.set(g.id, g));
      parsed.forEach(g => mergedMap.set(g.id, g));
      return Array.from(mergedMap.values());
    }
  } catch (e) {
    console.error('Failed to parse college groups from localStorage', e);
  }
  return defaultGroups;
}

/**
 * Create and persist a new college group
 */
export function createCollegeGroup(group: CollegeGroup): CollegeGroup[] {
  const current = getAvailableGroups();
  const exists = current.some(g => g.id === group.id || g.name.toLowerCase() === group.name.toLowerCase());
  if (exists) {
    throw new Error(`Группа с названием "${group.name}" уже существует.`);
  }

  const updated = [...current, group];
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save college group', e);
  }
  return updated;
}

/**
 * Delete a college group (default 37В cannot be deleted)
 */
export function deleteCollegeGroup(groupId: string): CollegeGroup[] {
  if (groupId === '37v' || groupId === 'grp-37v') {
    throw new Error('Базовую группу 37В удалить нельзя.');
  }

  const current = getAvailableGroups();
  const updated = current.filter(g => g.id !== groupId && g.name !== '37В');
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete college group', e);
  }
  return updated;
}

/**
 * Helper to find group by ID or Name
 */
export function getGroupByName(nameOrId: string): CollegeGroup | undefined {
  const groups = getAvailableGroups();
  return groups.find(g => g.name.toLowerCase() === nameOrId.toLowerCase() || g.id === nameOrId);
}
