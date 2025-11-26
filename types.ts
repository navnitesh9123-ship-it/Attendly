export type UserRole = 'teacher' | 'student' | null;

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rollNumber: string;
  department: string;
  year: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar: string;
  facultyId: string;
  department: string;
  specialization: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  attendedClasses: number;
}

export interface AttendanceRecord {
  date: string;
  subjectId: string;
  status: 'present' | 'absent' | 'excused';
  studentId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'system' | 'teacher';
  read: boolean;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  date: string;
  topic: string;
  status: 'present' | 'absent' | 'excused';
  smartNotes: string; // AI summary or user notes
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  subjectId?: string; // Optional link to a subject
}