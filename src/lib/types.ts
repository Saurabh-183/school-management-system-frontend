export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  teacherId?: string | null;
  organization?: string;
  classGrade?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
  organization?: string;
  assignedClasses?: string[];
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

export interface OrganizationSummary {
  name: string;
  adminsCount: number;
  teachersCount: number;
  studentsCount: number;
}

export interface SuperAdminOverviewResponse {
  metrics: {
    totalAdmins: number;
    totalOrganizations: number;
    totalTeachers: number;
    totalStudents: number;
    totalSessions: number;
  };
  admins: User[];
  organizations: OrganizationSummary[];
  teachers: Teacher[];
  students: User[];
  recentSessions: Session[];
}

export interface SchoolOverviewResponse {
  organizationName: string;
  metrics: {
    totalTeachers: number;
    totalStudents: number;
    totalClasses: number;
    totalSessions: number;
  };
  classes: string[];
  teachers: Teacher[];
  students: User[];
  sessions: Session[];
}

export interface CreateAdminPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  organization: string;
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
  organization?: string;
  classGrade?: string;
  teacherId?: string;
  specialization?: string;
  experience?: number;
}
