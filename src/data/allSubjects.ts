import { Subject } from '../types';
import { securitySubject } from './securitySubject';
import { microprocessorSubject } from './microprocessorSubject';
import { maintenanceSubject } from './maintenanceSubject';
import { networkSubject } from './networkSubject';
import { transmissionSubject } from './transmissionSubject';
import { mobileSubject } from './mobileSubject';
import { cadSubject } from './cadSubject';
import { tsiSubject } from './tsiSubject';

// Complete list of all 8 college subjects with extensive study notes & 10-question tests
export const allSubjects: Subject[] = [
  securitySubject,
  microprocessorSubject,
  maintenanceSubject,
  networkSubject,
  transmissionSubject,
  mobileSubject,
  cadSubject,
  tsiSubject
];

export const plannedSubjects: Subject[] = [];

export const defaultSubjectId = 'secbasics';

export function getSubjectById(id: string): Subject {
  const found = allSubjects.find((s) => s.id === id);
  return found || securitySubject;
}
