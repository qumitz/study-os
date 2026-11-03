import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, UserRole, StudentProgress, TopicStatus, StudentGradeRecord, PracticalSubmission } from '../types';

// Default project credentials for Study OS (public client config)
const DEFAULT_SUPABASE_URL = 'https://poxzqzsralyqydbgazoy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_tQFkeJhvqBjuhXqPdMaGdg_I7MeGg2g';

// Read config from Vite env variables, localStorage override, or default project credentials
export const getSupabaseCredentials = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  let localUrl = '';
  let localKey = '';
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localUrl = (localStorage.getItem('study_os_supabase_url') || '').trim();
      localKey = (localStorage.getItem('study_os_supabase_key') || '').trim();
    }
  } catch {
    // Ignore localStorage access errors
  }

  const url = (envUrl && envUrl.startsWith('http') && envUrl !== 'https://your-project.supabase.co') 
    ? envUrl 
    : (localUrl && localUrl.startsWith('http') ? localUrl : DEFAULT_SUPABASE_URL);

  const key = (envKey && envKey.length > 10 && envKey !== 'your-anon-key') 
    ? envKey 
    : (localKey && localKey.length > 10 ? localKey : DEFAULT_SUPABASE_ANON_KEY);

  return { url: url.trim(), key: key.trim() };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http') && key.length > 10);
};

// Singleton Supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseCredentials();
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
};

// Reset client when user updates settings
export const setSupabaseCredentials = (url: string, key: string) => {
  if (url && key) {
    localStorage.setItem('study_os_supabase_url', url.trim());
    localStorage.setItem('study_os_supabase_key', key.trim());
  } else {
    localStorage.removeItem('study_os_supabase_url');
    localStorage.removeItem('study_os_supabase_key');
  }
  supabaseInstance = null; // Re-create next time
};

/* =========================================================================
   AUTHENTICATION APIS
   ========================================================================= */

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  group: string;
  course: number;
}

/**
 * Register a new user with Supabase Auth & create their profile record
 */
export async function signUpWithSupabase(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: 'Supabase не настроен. Укажите URL и Anon Key в настройках.' };
  }

  try {
    const isAdmin = isSuperAdminEmail(data.email, data.name);
    const safeRole: UserRole = isAdmin ? 'admin' : (data.role === 'admin' ? 'student' : data.role);
    const safeGroup: string = safeRole === 'teacher' ? 'Все группы' : (data.group || '37В');
    const safeCourse: number = safeRole === 'teacher' ? 0 : (data.course || 3);

    const { data: authData, error: authError } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: safeRole,
          group_name: safeGroup,
          course: safeCourse
        }
      }
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Не удалось создать пользователя.' };
    }

    // Upsert into profiles table
    const appUser: User = {
      id: authData.user.id,
      email: data.email,
      name: data.name,
      role: safeRole,
      group: safeGroup,
      course: safeCourse
    };

    await upsertProfile(appUser);

    return { user: appUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Ошибка регистрации' };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithSupabase(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: 'Supabase не настроен.' };
  }

  try {
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Пользователь не найден.' };
    }

    // Fetch profile from database
    const profile = await fetchProfile(authData.user.id);
    if (profile) {
      return { user: profile, error: null };
    }

    // Fallback using auth user metadata if profile table isn't populated yet
    const meta = authData.user.user_metadata || {};
    const fallbackUser: User = {
      id: authData.user.id,
      email: authData.user.email || email,
      name: meta.name || authData.user.email?.split('@')[0] || 'Пользователь',
      role: (meta.role as UserRole) || 'student',
      group: meta.group_name || '37В',
      course: meta.course || 3
    };

    // Save profile for subsequent calls
    await upsertProfile(fallbackUser);

    return { user: fallbackUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Ошибка входа' };
  }
}

/**
 * Helper to get the exact callback URL for OAuth redirects on any domain or subpath
 */
export function getOAuthRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  const { origin, pathname } = window.location;
  // Trim trailing slash to normalize
  const cleanPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${origin}${cleanPath}`;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase не настроен.' };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOAuthRedirectUrl()
      }
    });
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || 'Ошибка OAuth' };
  }
}

/**
 * Sign in with Apple OAuth
 */
export async function signInWithAppleOAuth(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase не настроен.' };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: getOAuthRedirectUrl()
      }
    });
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || 'Ошибка OAuth' };
  }
}

/**
 * Sign out
 */
export async function signOutFromSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.error('Error signing out from Supabase', e);
    }
  }
}

/* =========================================================================
   PROFILES DATABASE APIS
   ========================================================================= */

export const ADMIN_ACCESS_KEY = 'STUDY-OS-ADMIN-2026';

export const TRUSTED_ADMIN_EMAILS: string[] = [
  'den.krivencheko@gmail.com',
  'den.krivenchenko@gmail.com',
  'admin@studyos.by'
];

/**
 * Check if the user is a designated platform administrator
 */
export function isSuperAdminEmail(email?: string, name?: string): boolean {
  if (!email && !name) return false;
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();

  if (TRUSTED_ADMIN_EMAILS.some(trusted => trusted.toLowerCase() === cleanEmail)) {
    return true;
  }

  // Check dynamically configured admin emails from environment variables (e.g. VITE_ADMIN_EMAILS)
  try {
    const envAdmins = ((import.meta as any).env?.VITE_ADMIN_EMAILS || '')
      .split(',')
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);
    if (envAdmins.includes(cleanEmail)) {
      return true;
    }
  } catch {}

  return cleanName.includes('кривенченко');
}

export async function fetchProfile(userId: string): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const isAdmin = isSuperAdminEmail(data.email, data.name);
    const role: UserRole = isAdmin ? 'admin' : (data.role as UserRole);

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: role,
      group: data.group_name || '37В',
      course: data.course || 3,
      avatar: data.avatar_url
    };
  } catch (err) {
    console.warn('Could not fetch profile from Supabase:', err);
    return null;
  }
}

export async function upsertProfile(user: User): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const isAdmin = isSuperAdminEmail(user.email, user.name);
  const effectiveRole = isAdmin ? 'admin' : user.role;

  try {
    const { error } = await client
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        group_name: user.group,
        course: user.course,
        avatar_url: user.avatar || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Error saving profile to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception upserting profile:', err);
    return false;
  }
}

/**
 * Synchronize authenticated Supabase session user with our profiles table
 */
export async function syncUserSession(sessionUser: SupabaseAuthUser): Promise<User> {
  const existing = await fetchProfile(sessionUser.id);
  if (existing) {
    return existing;
  }

  const meta = sessionUser.user_metadata || {};
  const fullName = meta.full_name || meta.name || sessionUser.email?.split('@')[0] || '';
  const avatar = meta.avatar_url || meta.picture || undefined;
  const isAdmin = isSuperAdminEmail(sessionUser.email, fullName);

  // New user via OAuth (e.g. Google) -> requires onboarding to confirm/fill ФИО and Group
  const newUser: User = {
    id: sessionUser.id,
    email: sessionUser.email || '',
    name: fullName || (isAdmin ? 'Кривенченко Денис Дмитриевич' : ''),
    role: isAdmin ? 'admin' : ((meta.role as UserRole) || 'student'),
    group: '37В',
    course: 3,
    avatar: avatar,
    needsOnboarding: !fullName && !isAdmin
  };

  await upsertProfile(newUser);
  return newUser;
}

/**
 * Update full name (ФИО) in Supabase profile
 */
export async function updateUserProfileName(userId: string, newName: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('profiles')
      .update({
        name: newName.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.warn('Failed to update user name:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Error updating name:', e);
    return false;
  }
}

/* =========================================================================
   STUDENT PROGRESS & GRADES DATABASE APIS
   ========================================================================= */

/**
 * Fetch all subject progress records for a user from Supabase
 */
export async function fetchAllUserProgressFromDb(userId: string): Promise<Record<string, StudentProgress>> {
  const client = getSupabaseClient();
  if (!client || !userId) return {};

  try {
    const { data, error } = await client
      .from('student_progress')
      .select('subject_id, topic_statuses, grades')
      .eq('user_id', userId);

    if (error || !data) return {};

    const result: Record<string, StudentProgress> = {};
    data.forEach((row: any) => {
      result[row.subject_id] = {
        topicStatuses: (row.topic_statuses as Record<string, TopicStatus>) || {},
        grades: (row.grades as Record<string, { score: number; completedAt: string }>) || {}
      };
    });
    return result;
  } catch (e) {
    console.warn('Failed to fetch user progress from DB:', e);
    return {};
  }
}

/**
 * Fetch student progress for a specific subject from Supabase
 */
export async function fetchStudentProgressFromDb(userId: string, subjectId: string): Promise<StudentProgress | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('student_progress')
      .select('topic_statuses, grades')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      topicStatuses: (data.topic_statuses as Record<string, TopicStatus>) || {},
      grades: (data.grades as Record<string, { score: number; completedAt: string }>) || {}
    };
  } catch (e) {
    console.warn('Error loading progress from Supabase:', e);
    return null;
  }
}

/**
 * Sync student progress to Supabase database in background
 */
export async function syncProgressToDb(userId: string, subjectId: string, progress: StudentProgress): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('student_progress')
      .upsert({
        user_id: userId,
        subject_id: subjectId,
        topic_statuses: progress.topicStatuses,
        grades: progress.grades,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,subject_id' });

    if (error) {
      console.warn('Failed to sync progress to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync progress error:', err);
    return false;
  }
}

/**
 * Fetch group students and grade matrix for Teacher Dashboard
 */
export async function fetchGroupStudentsFromDb(groupName: string, subjectId: string): Promise<StudentGradeRecord[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // 1. Fetch all student profiles in group
    const { data: profiles, error: profError } = await client
      .from('profiles')
      .select('id, name, group_name')
      .eq('role', 'student')
      .eq('group_name', groupName);

    if (profError || !profiles) return null;
    if (profiles.length === 0) return [];

    // 2. Fetch progress for all these students for this subject
    const userIds = profiles.map(p => p.id);
    const { data: progressRows, error: progError } = await client
      .from('student_progress')
      .select('user_id, grades')
      .eq('subject_id', subjectId)
      .in('user_id', userIds);

    const progressMap: Record<string, Record<string, { score: number }>> = {};
    if (progressRows) {
      progressRows.forEach((r: any) => {
        progressMap[r.user_id] = r.grades || {};
      });
    }

    // 3. Assemble StudentGradeRecords
    const records: StudentGradeRecord[] = profiles.map(p => {
      const studentGrades = progressMap[p.id] || {};
      const topicGrades: Record<string, number | null> = {};
      let total = 0;
      let count = 0;

      Object.entries(studentGrades).forEach(([tId, val]) => {
        if (typeof val?.score === 'number') {
          topicGrades[tId] = val.score;
          total += val.score;
          count++;
        }
      });

      const avg = count > 0 ? Math.round((total / count) * 10) / 10 : 0;

      return {
        studentId: p.id,
        studentName: p.name,
        group: p.group_name,
        topicGrades,
        practicalStatuses: {
          1: count >= 1 ? 'graded' : 'not_submitted',
          2: count >= 3 ? 'graded' : 'not_submitted',
          3: count >= 5 ? 'graded' : 'not_submitted',
          4: count >= 7 ? 'graded' : 'not_submitted'
        },
        averageScore: avg
      };
    });

    return records;
  } catch (err) {
    console.warn('Failed to load group students from Supabase:', err);
    return null;
  }
}

/* =========================================================================
   ADMINISTRATION APIS
   ========================================================================= */

/**
 * Fetch all registered user profiles across the entire college system
 */
export async function fetchAllProfilesFromDb(): Promise<User[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => {
      const isAdmin = isSuperAdminEmail(d.email, d.name);
      return {
        id: d.id,
        name: d.name,
        email: d.email,
        role: isAdmin ? 'admin' : ((d.role as UserRole) || 'student'),
        group: d.group_name || '37В',
        course: d.course || 3,
        avatar: d.avatar_url
      };
    });
  } catch (err) {
    console.warn('Failed to fetch all profiles from Supabase:', err);
    return [];
  }
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Delete a user profile and their associated progress from Supabase
 */
export async function deleteProfileFromDb(userId: string, userEmail?: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase не подключен' };
  }

  try {
    // 1. If userId is a valid UUID, attempt deletion by ID
    if (isValidUuid(userId)) {
      // 1a. Try RPC delete first (if admin function is created in Supabase)
      try {
        const { data: rpcData, error: rpcError } = await client.rpc('delete_user_by_admin', { target_user_id: userId });
        if (!rpcError && (rpcData as any)?.success !== false) {
          return { success: true, error: null };
        }
      } catch {
        // Ignore RPC failure and fallback to direct table deletion
      }

      // 1b. Delete associated student progress
      await client
        .from('student_progress')
        .delete()
        .eq('user_id', userId);

      // 1c. Delete profile record
      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.warn('Error deleting profile from Supabase by id:', error.message);
      }
    }

    // 2. Also delete by email if email is provided (handles non-UUID local IDs or duplicate accounts)
    if (userEmail && userEmail.trim()) {
      const normalizedEmail = userEmail.trim().toLowerCase();
      try {
        const { data: matchingProfiles } = await client
          .from('profiles')
          .select('id')
          .ilike('email', normalizedEmail);

        if (matchingProfiles && matchingProfiles.length > 0) {
          for (const mp of matchingProfiles) {
            await client.from('student_progress').delete().eq('user_id', mp.id);
            await client.from('profiles').delete().eq('id', mp.id);
          }
        }
      } catch (emailErr) {
        console.warn('Error deleting profile by email from Supabase:', emailErr);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception deleting profile:', err);
    return { success: false, error: err.message || 'Ошибка удаления' };
  }
}

/**
 * Create or register a teacher profile in Supabase
 */
export async function createTeacherProfileInDb(teacher: {
  id?: string;
  name: string;
  email: string;
  group?: string;
  course?: number;
}): Promise<User | null> {
  const client = getSupabaseClient();
  const teacherId = teacher.id || `tch-${Date.now()}`;
  const teacherUser: User = {
    id: teacherId,
    name: teacher.name,
    email: teacher.email,
    role: 'teacher',
    group: teacher.group || '37В',
    course: teacher.course || 3
  };

  if (client) {
    try {
      await client
        .from('profiles')
        .upsert({
          id: teacherId,
          email: teacher.email,
          name: teacher.name,
          role: 'teacher',
          group_name: teacher.group || '37В',
          course: teacher.course || 3,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Could not save teacher to Supabase, saved locally:', e);
    }
  }

  return teacherUser;
}

/**
 * Update a user's role in Supabase (e.g. promoting to admin, assigning teacher)
 */
export async function updateUserRoleInDb(userId: string, newRole: UserRole, userEmail?: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase не настроен' };
  }

  try {
    let updatedAny = false;

    // 1. If valid UUID, attempt update by ID
    if (isValidUuid(userId)) {
      // 1a. Try RPC function if configured
      try {
        const { data: rpcData, error: rpcErr } = await client.rpc('update_user_role_by_admin', {
          target_user_id: userId,
          new_role: newRole
        });
        if (!rpcErr && (rpcData as any)?.success !== false) {
          return { success: true, error: null };
        }
      } catch {
        // Fallback to table update
      }

      // 1b. Direct table update by id
      const { error: idError, count } = await client
        .from('profiles')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        }, { count: 'exact' })
        .eq('id', userId);

      if (!idError && count && count > 0) {
        updatedAny = true;
      } else if (idError) {
        console.warn('Failed to update user role by id in Supabase:', idError.message);
      }
    }

    // 2. Also attempt update by email if provided
    if (userEmail && userEmail.trim()) {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const { error: emailError, count } = await client
        .from('profiles')
        .update({ 
          role: newRole, 
          updated_at: new Date().toISOString() 
        }, { count: 'exact' })
        .ilike('email', normalizedEmail);

      if (!emailError && count && count > 0) {
        updatedAny = true;
      } else if (emailError) {
        console.warn('Failed to update user role by email in Supabase:', emailError.message);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception updating user role:', err);
    return { success: false, error: err.message || 'Ошибка обновления роли' };
  }
}

/**
 * Update a user's group and course in Supabase
 */
export async function updateUserGroupInDb(userId: string, newGroup: string, course: number = 3, userEmail?: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase не настроен' };
  }

  try {
    if (isValidUuid(userId)) {
      const { error } = await client
        .from('profiles')
        .update({ 
          group_name: newGroup, 
          course, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.warn('Failed to update user group by id in Supabase:', error.message);
      }
    }

    if (userEmail && userEmail.trim()) {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const { error: emailError } = await client
        .from('profiles')
        .update({ 
          group_name: newGroup, 
          course, 
          updated_at: new Date().toISOString() 
        })
        .ilike('email', normalizedEmail);

      if (emailError) {
        console.warn('Failed to update user group by email in Supabase:', emailError.message);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Exception updating user group:', err);
    return { success: false, error: err.message || 'Ошибка обновления группы' };
  }
}


/* =========================================================================
   PRACTICAL WORKS CLOUD SYNCHRONIZATION
   ========================================================================= */

/**
 * Sync a practical submission to Supabase (dual-target: practical_submissions table & student_progress)
 */
export async function syncPracticalSubmissionToDb(submission: PracticalSubmission): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  let success = false;

  // 1. Resolve student UUID
  let targetUserId = submission.studentId;
  const isUuid = isValidUuid(targetUserId);
  if (!isUuid) {
    try {
      const { data: { user: authUser } } = await client.auth.getUser();
      if (authUser && authUser.id) {
        targetUserId = authUser.id;
      }
    } catch {}
  }

  // 2. Try saving to dedicated table 'practical_submissions' if it exists
  try {
    const { error: tableError } = await client
      .from('practical_submissions')
      .upsert({
        id: submission.id,
        student_id: isValidUuid(targetUserId) ? targetUserId : null,
        student_name: submission.studentName,
        group_name: submission.group,
        subject_id: submission.subjectId,
        subject_title: submission.subjectTitle,
        work_number: submission.workNumber,
        work_title: submission.workTitle,
        content_html: submission.contentHtml,
        submitted_at: submission.submittedAt,
        updated_at: new Date().toISOString(),
        status: submission.status,
        grade: submission.grade ?? null,
        graded_by: submission.gradedBy ?? null,
        graded_at: submission.gradedAt ?? null,
        teacher_feedback: submission.teacherFeedback ?? null
      }, { onConflict: 'id' });

    if (!tableError) {
      success = true;
    }
  } catch {
    // Table might not exist yet in Supabase schema
  }

  // 3. Fallback/Dual storage inside 'student_progress' (guaranteed to exist in DB)
  if (isValidUuid(targetUserId)) {
    try {
      const { data: existingRow } = await client
        .from('student_progress')
        .select('topic_statuses, grades')
        .eq('user_id', targetUserId)
        .eq('subject_id', submission.subjectId)
        .maybeSingle();

      const existingStatuses = (existingRow?.topic_statuses as Record<string, any>) || {};
      const existingGrades = (existingRow?.grades as Record<string, any>) || {};
      const existingPracticals = (existingGrades._practicals as Record<string, PracticalSubmission>) || {};

      const nextPracticals = {
        ...existingPracticals,
        [submission.workNumber]: {
          ...submission,
          studentId: targetUserId,
          updatedAt: new Date().toISOString()
        }
      };

      const nextGrades = {
        ...existingGrades,
        _practicals: nextPracticals
      };

      // If graded, also update topic status for related topic
      const nextStatuses = { ...existingStatuses };
      if (submission.status === 'graded') {
        nextStatuses[`practical-${submission.workNumber}`] = 'completed';
      }

      const { error: progError } = await client
        .from('student_progress')
        .upsert({
          user_id: targetUserId,
          subject_id: submission.subjectId,
          topic_statuses: nextStatuses,
          grades: nextGrades,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,subject_id' });

      if (!progError) {
        success = true;
      }
    } catch (e) {
      console.warn('Failed to sync practical to student_progress:', e);
    }
  }

  return success;
}

/**
 * Fetch all practical submissions for a group (and optional subject) from Supabase
 */
export async function fetchGroupPracticalSubmissionsFromDb(
  groupName: string,
  subjectId?: string
): Promise<PracticalSubmission[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const resultsMap = new Map<string, PracticalSubmission>();

  // Source A: Try dedicated 'practical_submissions' table
  try {
    let query = client.from('practical_submissions').select('*');
    if (groupName && groupName !== 'Все группы') {
      query = query.eq('group_name', groupName);
    }
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      data.forEach((row: any) => {
        const sub: PracticalSubmission = {
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          group: row.group_name,
          subjectId: row.subject_id,
          subjectTitle: row.subject_title,
          workNumber: Number(row.work_number),
          workTitle: row.work_title,
          contentHtml: row.content_html || '',
          submittedAt: row.submitted_at,
          updatedAt: row.updated_at,
          status: row.status,
          grade: row.grade,
          gradedAt: row.graded_at,
          gradedBy: row.graded_by,
          teacherFeedback: row.teacher_feedback
        };
        resultsMap.set(sub.id, sub);
      });
    }
  } catch {}

  // Source B: Read from student_progress.grades._practicals
  try {
    let profQuery = client.from('profiles').select('id, name, group_name').eq('role', 'student');
    if (groupName && groupName !== 'Все группы') {
      profQuery = profQuery.eq('group_name', groupName);
    }
    const { data: profiles } = await profQuery;

    if (profiles && profiles.length > 0) {
      const userIds = profiles.map(p => p.id);
      let progQuery = client.from('student_progress').select('user_id, subject_id, grades').in('user_id', userIds);
      if (subjectId) {
        progQuery = progQuery.eq('subject_id', subjectId);
      }
      const { data: progressRows } = await progQuery;

      if (progressRows) {
        progressRows.forEach((row: any) => {
          const practicals = row.grades?._practicals;
          if (practicals && typeof practicals === 'object') {
            const studentProfile = profiles.find(p => p.id === row.user_id);
            Object.values(practicals).forEach((sub: any) => {
              if (sub && sub.workNumber) {
                const normalized: PracticalSubmission = {
                  id: sub.id || `sub-${row.user_id}-${row.subject_id}-${sub.workNumber}`,
                  studentId: row.user_id,
                  studentName: studentProfile?.name || sub.studentName || 'Студент',
                  group: studentProfile?.group_name || sub.group || groupName,
                  subjectId: row.subject_id,
                  subjectTitle: sub.subjectTitle || '',
                  workNumber: Number(sub.workNumber),
                  workTitle: sub.workTitle || `Практическая работа №${sub.workNumber}`,
                  contentHtml: sub.contentHtml || '',
                  submittedAt: sub.submittedAt || new Date().toISOString(),
                  updatedAt: sub.updatedAt || new Date().toISOString(),
                  status: sub.status || 'submitted',
                  grade: sub.grade,
                  gradedAt: sub.gradedAt,
                  gradedBy: sub.gradedBy,
                  teacherFeedback: sub.teacherFeedback
                };

                const existing = resultsMap.get(normalized.id);
                if (!existing || new Date(normalized.updatedAt) > new Date(existing.updatedAt)) {
                  resultsMap.set(normalized.id, normalized);
                }
              }
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('Failed to fetch practicals from student_progress:', e);
  }

  return Array.from(resultsMap.values());
}

/**
 * Fetch a student's own practical submissions from Supabase
 */
export async function fetchStudentPracticalSubmissionsFromDb(
  studentId: string,
  subjectId?: string
): Promise<PracticalSubmission[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const resultsMap = new Map<string, PracticalSubmission>();

  // Source A: Try table
  try {
    let query = client.from('practical_submissions').select('*');
    if (isValidUuid(studentId)) {
      query = query.eq('student_id', studentId);
    }
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    const { data } = await query;
    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        const sub: PracticalSubmission = {
          id: row.id,
          studentId: row.student_id,
          studentName: row.student_name,
          group: row.group_name,
          subjectId: row.subject_id,
          subjectTitle: row.subject_title,
          workNumber: Number(row.work_number),
          workTitle: row.work_title,
          contentHtml: row.content_html || '',
          submittedAt: row.submitted_at,
          updatedAt: row.updated_at,
          status: row.status,
          grade: row.grade,
          gradedAt: row.graded_at,
          gradedBy: row.graded_by,
          teacherFeedback: row.teacher_feedback
        };
        resultsMap.set(sub.id, sub);
      });
    }
  } catch {}

  // Source B: Read student_progress
  if (isValidUuid(studentId)) {
    try {
      let progQuery = client.from('student_progress').select('user_id, subject_id, grades').eq('user_id', studentId);
      if (subjectId) {
        progQuery = progQuery.eq('subject_id', subjectId);
      }
      const { data: rows } = await progQuery;
      if (rows) {
        rows.forEach((row: any) => {
          const practicals = row.grades?._practicals;
          if (practicals && typeof practicals === 'object') {
            Object.values(practicals).forEach((sub: any) => {
              if (sub && sub.workNumber) {
                const normalized: PracticalSubmission = {
                  id: sub.id || `sub-${studentId}-${row.subject_id}-${sub.workNumber}`,
                  studentId: studentId,
                  studentName: sub.studentName || 'Студент',
                  group: sub.group || '37В',
                  subjectId: row.subject_id,
                  subjectTitle: sub.subjectTitle || '',
                  workNumber: Number(sub.workNumber),
                  workTitle: sub.workTitle || `Практическая работа №${sub.workNumber}`,
                  contentHtml: sub.contentHtml || '',
                  submittedAt: sub.submittedAt || new Date().toISOString(),
                  updatedAt: sub.updatedAt || new Date().toISOString(),
                  status: sub.status || 'submitted',
                  grade: sub.grade,
                  gradedAt: sub.gradedAt,
                  gradedBy: sub.gradedBy,
                  teacherFeedback: sub.teacherFeedback
                };

                const existing = resultsMap.get(normalized.id);
                if (!existing || new Date(normalized.updatedAt) > new Date(existing.updatedAt)) {
                  resultsMap.set(normalized.id, normalized);
                }
              }
            });
          }
        });
      }
    } catch {}
  }

  return Array.from(resultsMap.values());
}
