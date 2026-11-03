import { CollegeGroup } from '../types';
import { availableGroups as defaultGroups } from '../data/mockData';

const GROUPS_STORAGE_KEY = 'study_os_college_groups';
const DELETED_GROUPS_STORAGE_KEY = 'study_os_deleted_group_identifiers';

/**
 * Get all deleted group identifiers (IDs and lowercase names)
 */
export function getDeletedGroupIdentifiers(): string[] {
  try {
    const saved = localStorage.getItem(DELETED_GROUPS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a group identifier (ID and name) as permanently deleted
 */
export function markGroupAsDeleted(id: string, name?: string): void {
  try {
    const list = getDeletedGroupIdentifiers();
    const additions: string[] = [];
    if (id) additions.push(id.toLowerCase().trim());
    if (name) additions.push(name.toLowerCase().trim());
    const updated = Array.from(new Set([...list, ...additions]));
    localStorage.setItem(DELETED_GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to mark group as deleted', e);
  }
}

/**
 * Remove a group identifier from deleted list (when group is re-created)
 */
export function unmarkGroupAsDeleted(id: string, name?: string): void {
  try {
    const list = getDeletedGroupIdentifiers();
    const targets: string[] = [];
    if (id) targets.push(id.toLowerCase().trim());
    if (name) targets.push(name.toLowerCase().trim());
    const updated = list.filter(item => !targets.includes(item));
    localStorage.setItem(DELETED_GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to unmark group as deleted', e);
  }
}

/**
 * Check if a group has been deleted by an administrator
 */
export function isGroupDeleted(id?: string, name?: string): boolean {
  if (!id && !name) return false;
  const list = getDeletedGroupIdentifiers();
  if (id && list.includes(id.toLowerCase().trim())) return true;
  if (name && list.includes(name.toLowerCase().trim())) return true;
  return false;
}

/**
 * Returns all available college groups (default groups + custom created by admin)
 */
export function getAvailableGroups(): CollegeGroup[] {
  const baseGroup37v = defaultGroups.find(g => g.name === '37В' || g.id === '37v') || defaultGroups[0];
  const deleted = getDeletedGroupIdentifiers();

  try {
    const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
    if (saved) {
      const parsed: CollegeGroup[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Filter out any explicitly deleted groups (while protecting base 37В)
        const filtered = parsed.filter(g => {
          if (!g || !g.id) return false;
          if (g.name === '37В' || g.id === '37v' || g.id === 'grp-37v') return true;
          return !isGroupDeleted(g.id, g.name);
        });

        // Ensure 37В is always present as the core group
        if (!filtered.some(g => g.name === '37В' || g.id === '37v')) {
          filtered.unshift(baseGroup37v);
        }

        return filtered;
      }
    }
  } catch (e) {
    console.error('Failed to parse college groups from localStorage', e);
  }

  // Initial load when no storage exists:
  // Take default groups, filter out any previously deleted
  const initial = defaultGroups.filter(g => {
    if (g.name === '37В' || g.id === '37v' || g.id === 'grp-37v') return true;
    return !isGroupDeleted(g.id, g.name);
  });

  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(initial));
  } catch {}

  return initial;
}

/**
 * Create and persist a new college group
 */
export function createCollegeGroup(group: CollegeGroup): CollegeGroup[] {
  const current = getAvailableGroups();
  const exists = current.some(
    g => g.id === group.id || g.name.toLowerCase().trim() === group.name.toLowerCase().trim()
  );
  if (exists) {
    throw new Error(`Группа с названием "${group.name}" уже существует.`);
  }

  // If this group was previously marked as deleted, restore it
  unmarkGroupAsDeleted(group.id, group.name);

  const updated = [...current, group];
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save college group', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('study_os_groups_updated', { 
      detail: { group, action: 'created' } 
    }));
  }

  return updated;
}

/**
 * Delete a college group (default 37В cannot be deleted)
 */
export function deleteCollegeGroup(groupIdOrName: string): CollegeGroup[] {
  const current = getAvailableGroups();
  const target = current.find(
    g => g.id === groupIdOrName || g.name.toLowerCase().trim() === groupIdOrName.toLowerCase().trim()
  );

  if (!target) {
    return current;
  }

  // 37В is the protected base group and can NEVER be deleted
  if (target.id === '37v' || target.id === 'grp-37v' || target.name.trim() === '37В') {
    throw new Error('Базовую группу 37В удалить нельзя.');
  }

  // Mark group as permanently deleted
  markGroupAsDeleted(target.id, target.name);

  // Filter out ONLY this specific target group!
  const updated = current.filter(
    g => g.id !== target.id && g.name.toLowerCase().trim() !== target.name.toLowerCase().trim()
  );

  // Ensure base group 37В is always preserved
  const baseGroup37v = defaultGroups.find(g => g.name === '37В' || g.id === '37v') || defaultGroups[0];
  if (!updated.some(g => g.name === '37В' || g.id === '37v')) {
    updated.unshift(baseGroup37v);
  }

  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete college group', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('study_os_groups_updated', { 
      detail: { groupId: target.id, groupName: target.name, action: 'deleted' } 
    }));
  }

  return updated;
}

/**
 * Helper to find group by ID or Name
 */
export function getGroupByName(nameOrId: string): CollegeGroup | undefined {
  const groups = getAvailableGroups();
  return groups.find(g => g.name.toLowerCase().trim() === nameOrId.toLowerCase().trim() || g.id === nameOrId);
}
