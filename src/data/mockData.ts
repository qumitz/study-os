import { CollegeGroup, StudentGradeRecord, User } from '../types';

export const availableGroups: CollegeGroup[] = [
  {
    id: '37v',
    name: '37В',
    course: 3,
    specialty: 'ПОИТ — 2-40 02 02 / ТЭСВТ 5-04-0713-01 (Лидский колледж)',
    subjectIds: ['secbasics', 'pms', 'tesvt', 'stoi', 'pspi', 'rmp', 'sapr', 'tsi']
  }
];

export const initialUsers: Record<string, User> = {
  student: {
    id: 'usr-student-1',
    name: 'Алексей Иванов',
    email: 'a.ivanov@student.lidacollege.by',
    role: 'student',
    group: '37В',
    course: 3
  },
  teacher: {
    id: 'usr-teacher-1',
    name: 'Селедцов Александр Игоревич',
    email: 'a.seledtsov@lidacollege.by',
    role: 'teacher',
    group: '37В',
    course: 3
  },
  admin: {
    id: 'usr-admin-1',
    name: 'Администратор платформы',
    email: 'admin@studyos.by',
    role: 'admin',
    group: '37В',
    course: 3
  }
};

export const initialGroup37vStudents: StudentGradeRecord[] = [
  {
    studentId: 'usr-student-1',
    studentName: 'Алексей Иванов',
    group: '37В',
    topicGrades: {
      'top-intro': 10,
      'top-1-1': null,
      'top-1-2': null,
      'top-2-1': null,
      'top-2-2': null,
      'top-3-1': null,
      'top-3-2': null,
      'top-4-1': null,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'not_submitted', 2: 'not_submitted', 3: 'not_submitted', 4: 'not_submitted' },
    averageScore: 10
  },
  {
    studentId: 'st-2',
    studentName: 'Анастасия Мороз',
    group: '37В',
    topicGrades: {
      'top-intro': 10,
      'top-1-1': 9,
      'top-1-2': 10,
      'top-2-1': 9,
      'top-2-2': 10,
      'top-3-1': 8,
      'top-3-2': 9,
      'top-4-1': null,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'graded', 2: 'graded', 3: 'not_submitted', 4: 'not_submitted' },
    averageScore: 9.3
  },
  {
    studentId: 'st-3',
    studentName: 'Дмитрий Ковалёв',
    group: '37В',
    topicGrades: {
      'top-intro': 9,
      'top-1-1': 8,
      'top-1-2': 9,
      'top-2-1': 8,
      'top-2-2': 7,
      'top-3-1': 8,
      'top-3-2': null,
      'top-4-1': null,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'graded', 2: 'submitted', 3: 'not_submitted', 4: 'not_submitted' },
    averageScore: 8.2
  },
  {
    studentId: 'st-4',
    studentName: 'Максим Белов',
    group: '37В',
    topicGrades: {
      'top-intro': 8,
      'top-1-1': 5,
      'top-1-2': 4,
      'top-2-1': null,
      'top-2-2': null,
      'top-3-1': null,
      'top-3-2': null,
      'top-4-1': null,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'not_submitted', 2: 'not_submitted', 3: 'not_submitted', 4: 'not_submitted' },
    averageScore: 5.7
  },
  {
    studentId: 'st-5',
    studentName: 'Полина Васильева',
    group: '37В',
    topicGrades: {
      'top-intro': 10,
      'top-1-1': 9,
      'top-1-2': 8,
      'top-2-1': 9,
      'top-2-2': 8,
      'top-3-1': 9,
      'top-3-2': 9,
      'top-4-1': 10,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'graded', 2: 'graded', 3: 'graded', 4: 'not_submitted' },
    averageScore: 8.9
  },
  {
    studentId: 'st-6',
    studentName: 'Владислав Рудницкий',
    group: '37В',
    topicGrades: {
      'top-intro': 7,
      'top-1-1': 6,
      'top-1-2': 7,
      'top-2-1': 6,
      'top-2-2': null,
      'top-3-1': null,
      'top-3-2': null,
      'top-4-1': null,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'submitted', 2: 'not_submitted', 3: 'not_submitted', 4: 'not_submitted' },
    averageScore: 6.5
  },
  {
    studentId: 'st-7',
    studentName: 'Артём Сидоров',
    group: '37В',
    topicGrades: {
      'top-intro': 3, // Failed attempt
      'top-1-1': null,
      'top-1-2': null,
      'top-2-1': null,
      'top-2-2': null,
      'top-3-1': null,
      'top-3-2': null,
      'top-4-1': null,
      'top-4-2': null,
      'top-4-4': null,
      'top-okr-1': null,
      'top-5-1': null,
      'top-5-2': null
    },
    practicalStatuses: { 1: 'not_submitted', 2: 'not_submitted', 3: 'not_submitted', 4: 'not_submitted' },
    averageScore: 3.0
  }
];
