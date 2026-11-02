import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, UserRole, StudentProgress, TopicStatus, StudentGradeRecord } from '../types';

// Default project credentials for Study OS (public client config)
const DEFAULT_SUPABASE_URL = 'https://poxzqzsralyqydbgazoy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_tQFkeJhvqBjuhXqPdMaGdg_I7MeGg2g';

// Read config from Vite env variables, localStorage override, or default project credentials
export const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem('study_os_supabase_url');
  const localKey = localStorage.getItem('study_os_supabase_key');

  const url = (envUrl && envUrl !== 'https://your-project.supabase.co') 
    ? envUrl 
    : (localUrl || DEFAULT_SUPABASE_URL);

  const key = (envKey && envKey !== 'your-anon-key') 
    ? envKey 
    : (localKey || DEFAULT_SUPABASE_ANON_KEY);

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
    const { data: authData, error: authError } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
          group_name: data.group,
          course: data.course
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
      role: data.role,
      group: data.group,
      course: data.course
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
        redirectTo: window.location.origin
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
        redirectTo: window.location.origin
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

/**
 * Check if the user is the designated administrator (Денис Кривенченко)
 */
export function isSuperAdminEmail(email?: string, name?: string): boolean {
  if (!email && !name) return false;
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();
  return (
    cleanEmail === 'den.krivencheko@gmail.com' ||
    cleanEmail === 'den.krivenchenko@gmail.com' ||
    cleanName.includes('кривенченко')
  );
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
 * Delete a user profile and their associated progress from Supabase
 */
export async function deleteProfileFromDb(userId: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase не подключен' };
  }

  try {
    // 1. Delete associated student progress
    await client
      .from('student_progress')
      .delete()
      .eq('user_id', userId);

    // 2. Delete profile record
    const { error } = await client
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.warn('Error deleting profile from Supabase:', error.message);
      return { success: false, error: error.message };
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
