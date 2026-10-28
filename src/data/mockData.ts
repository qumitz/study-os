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

export const initialGroup37vStudents: StudentGradeRecord[] = [];

