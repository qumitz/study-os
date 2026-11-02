import { CollegeGroup, StudentGradeRecord, User } from '../types';

export const availableGroups: CollegeGroup[] = [
  {
    id: '37v',
    name: '37В',
    course: 3,
    specialty: 'ПОИТ / ТЭСВТ (Лидский колледж)',
    subjectIds: ['secbasics', 'pms', 'tesvt', 'stoi', 'pspi', 'rmp', 'sapr', 'tsi']
  },
  {
    id: '36v',
    name: '36В',
    course: 3,
    specialty: 'ТЭСВТ (Лидский колледж)',
    subjectIds: ['secbasics', 'pms', 'tesvt', 'stoi']
  },
  {
    id: '35v',
    name: '35В',
    course: 3,
    specialty: 'ПОИТ (Лидский колледж)',
    subjectIds: ['secbasics', 'rmp', 'sapr', 'tsi']
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

