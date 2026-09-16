export type Gender = 'male' | 'female';

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  avatar: string;
  groupId: string;
  points: number;
  stars: number;
  role: string;
  birthDate: string;
  customPhotoUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  color: string;
  slogan: string;
}

export interface Criterion {
  id: string;
  name: string;
  points: number;
  category: 'positive' | 'reminder';
  icon: string;
  description: string;
}

export interface PointLog {
  id: string;
  studentId: string;
  criterionId: string;
  criterionName: string;
  points: number;
  timestamp: string;
  note?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceDay {
  date: string; // YYYY-MM-DD
  records: AttendanceRecord[];
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  rewardPoints: number;
  completedStudentIds: string[];
  createdAt: string;
}

export interface ClassConfig {
  className: string;
  schoolName: string;
  teacherName: string;
  teacherTitle: string;
  topic: string;
  classMotto: string;
  academicYear: string;
  soundEnabled: boolean;
  theme: string;
  isEditMode: boolean;
  geminiApiKey?: string;
  homeBanner?: string;
  gameBanner?: string;
  tamKhoiBanner?: string;
  teacherAvatar?: string;
}

export interface RankTier {
  tier: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  title: string;
  badge: string;
  hatIcon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  cardBorderClass: string;
  cardShadowClass?: string;
  description: string;
  perks: string[];
}

export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  bg: string;
}

export type ActiveTab = 
  | 'students'
  | 'attendance'
  | 'honor'
  | 'groups'
  | 'assignments'
  | 'games'
  | 'reports'
  | 'settings';
