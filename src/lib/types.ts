export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  teacherId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  _id: string;
  teacherId: string | Teacher;
  userId: string | User | null;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED';
  completedAt: string | null;
  teacher?: Teacher;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableSessionsResponse {
  date: string;
  totalAvailable: number;
  pagination?: PaginationMetadata;
  sessions: Session[];
}

export interface UserSessionsResponse {
  user: User;
  upcomingSessions: Session[];
  completedSessions: Session[];
}

export interface TeacherSessionsResponse {
  teacher: Teacher;
  availableSessions: Session[];
  bookedSessions: Session[];
  completedSessions: Session[];
  metrics: {
    totalAvailable: number;
    totalBooked: number;
    totalCompleted: number;
    totalSessions: number;
  };
}

export interface AdminMetrics {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalSessions: number;
  availableSessions: number;
  bookedSessions: number;
  completedSessions: number;
}

export interface AdminOverviewResponse {
  metrics: AdminMetrics;
  recentSessions: Session[];
  users: User[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
  teacherId?: string;
}
