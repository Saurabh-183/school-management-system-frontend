import {
  User,
  Teacher,
  Session,
  AvailableSessionsResponse,
  UserSessionsResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN_STORAGE_KEY = 'mentora_access_token';
const USER_STORAGE_KEY = 'mentora_current_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAuth(token: string, user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = getStoredToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const errorMsg = json?.message || `Request failed with status ${res.status}`;
    if (res.status === 401 && (errorMsg.includes('Session Terminated') || errorMsg.includes('another location'))) {
      clearStoredAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mentora:session-terminated', { detail: { message: errorMsg } }));
      }
    }
    throw new Error(errorMsg);
  }
  return json.data as T;
}

export const api = {
  // Authentication & RBAC APIs
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    setStoredAuth(data.accessToken, data.user);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    setStoredAuth(data.accessToken, data.user);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<User>(res);
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearStoredAuth();
    }
  },

  // Super Admin: Stealth Impersonation Direct Login (activity not recorded)
  async impersonateLogin(payload: { targetUserId?: string; email?: string; password?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/impersonate-login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<AuthResponse>(res);
    setStoredAuth(data.accessToken, data.user);
    return data;
  },

  // Super Admin: Activity Logs & Audit Module
  async getActivityLogs(status?: string, search?: string): Promise<import('./types').ActivityLogsResponse> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/admin/activity-logs${query}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<import('./types').ActivityLogsResponse>(res);
  },

  // School Admin provisions Teacher under their facility
  async provisionTeacher(payload: import('./types').CreateTeacherPayload): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/create-teacher`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Teacher or Admin enrolls Student under their class/facility
  async createStudent(payload: import('./types').CreateStudentPayload): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/create-student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // API 1: Create User
  async createUser(data: { fullName: string; email: string; phone: string; password?: string; role?: string }): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Helper for UI dropdowns: List users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<User[]>(res);
  },

  // API 2: Create Session (Teacher or Admin)
  async createSession(data: {
    teacherId: string;
    startTime: string;
    endTime: string;
  }): Promise<Session> {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Session>(res);
  },

  // API 3: Available Sessions for Booking (with dateTimestamp, page, limit, search)
  async getAvailableSessions(
    dateTimestamp: string | number,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<AvailableSessionsResponse> {
    const query = new URLSearchParams({
      dateTimestamp: String(dateTimestamp),
    });
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE_URL}/sessions/available?${query.toString()}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<AvailableSessionsResponse>(res);
  },

  // API 4: Book Session (Student or Admin)
  async bookSession(sessionId: string, userId?: string): Promise<Session> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/book`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userId ? { userId } : {}),
    });
    return handleResponse<Session>(res);
  },

  // API 5: Mark Session Complete (Teacher or Admin)
  async completeSession(sessionId: string): Promise<Session> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse<Session>(res);
  },

  // API 6: User Session List (MongoDB Aggregation Pipeline)
  async getUserSessions(userId: string): Promise<UserSessionsResponse> {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/sessions`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<UserSessionsResponse>(res);
  },

  // Helper for UI dropdowns: List teachers
  async getTeachers(): Promise<Teacher[]> {
    const res = await fetch(`${API_BASE_URL}/teachers`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<Teacher[]>(res);
  },

  // Admin Only: Create Teacher
  async createTeacher(data: { fullName: string; email: string; specialization: string; experience: number }): Promise<Teacher> {
    const res = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Teacher>(res);
  },

  // Role Dashboard: Teacher's own schedule & sessions
  async getTeacherSessions(teacherId: string): Promise<import('./types').TeacherSessionsResponse> {
    const res = await fetch(`${API_BASE_URL}/teachers/${teacherId}/sessions`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<import('./types').TeacherSessionsResponse>(res);
  },

  // Role Dashboard: Admin platform overview & metrics
  async getAdminOverview(): Promise<import('./types').AdminOverviewResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/overview`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<import('./types').AdminOverviewResponse>(res);
  },

  // Role Dashboard: Super Admin full hierarchy overview
  async getSuperOverview(): Promise<import('./types').SuperAdminOverviewResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/super-overview`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<import('./types').SuperAdminOverviewResponse>(res);
  },

  // Super Admin: Create new Organization / School Admin
  async createAdmin(payload: import('./types').CreateAdminPayload): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/admin/create-admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Organization / School Admin overview
  async getSchoolOverview(): Promise<import('./types').SchoolOverviewResponse> {
    const res = await fetch(`${API_BASE_URL}/admin/school-overview`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<import('./types').SchoolOverviewResponse>(res);
  },

  // Learning Resources: Notes, Videos, Documents
  async getSessionResources(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/resources`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    return handleResponse<any>(res);
  },

  async addLectureNote(sessionId: string, data: { title: string; content: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async addVideoLecture(sessionId: string, data: { title: string; videoUrl: string; duration?: string; description?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/videos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async addSubjectDocument(sessionId: string, data: { title: string; fileUrl: string; fileType?: string; fileSize?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/documents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // 1-Click Cloud Database Seeder
  async seedDemoData(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset: true }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.message || `Seeding failed with status ${res.status}`);
    }
    return json;
  },
};
