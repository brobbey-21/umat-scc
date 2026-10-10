import { StudentRegistration, DenominationAdmin, Denomination, OutreachStatus } from '../types';

const API_BASE = '/api';
const TOKEN_KEY = 'scc_admin_token';

// ── Token management ────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── Fetch wrapper ───────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && path !== '/auth/login') {
    clearToken();
    throw new Error('Authentication required');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

// ── Auth API ────────────────────────────────────────────────────────────────

export async function login(password: string): Promise<string> {
  const data = await apiFetch<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  setToken(data.token);
  return data.token;
}

export function logout(): void {
  clearToken();
}

// ── Students API ────────────────────────────────────────────────────────────

export async function fetchStudentCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>('/students/count');
  return data.count;
}

export async function fetchStudents(): Promise<StudentRegistration[]> {
  return apiFetch<StudentRegistration[]>('/students');
}

export async function createStudent(student: Partial<StudentRegistration>): Promise<StudentRegistration> {
  return apiFetch<StudentRegistration>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
}

export async function updateStudentStatus(studentId: string, status: OutreachStatus, note?: string): Promise<StudentRegistration> {
  return apiFetch<StudentRegistration>(`/students/${studentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}

// ── Admins API ──────────────────────────────────────────────────────────────

export async function fetchAdmins(): Promise<DenominationAdmin[]> {
  return apiFetch<DenominationAdmin[]>('/admins');
}

export async function createAdmin(admin: Partial<DenominationAdmin>): Promise<DenominationAdmin> {
  return apiFetch<DenominationAdmin>('/admins', {
    method: 'POST',
    body: JSON.stringify(admin),
  });
}

export async function deleteAdmin(adminId: string): Promise<void> {
  await apiFetch<{ message: string }>(`/admins/${adminId}`, {
    method: 'DELETE',
  });
}

// ── Denominations API ───────────────────────────────────────────────────────

export async function fetchDenominations(): Promise<Denomination[]> {
  return apiFetch<Denomination[]>('/denominations');
}

export async function createDenomination(denom: Partial<Denomination>): Promise<Denomination> {
  return apiFetch<Denomination>('/denominations', {
    method: 'POST',
    body: JSON.stringify(denom),
  });
}

export async function updateDenomination(denomId: string, updates: Partial<Denomination>): Promise<Denomination> {
  return apiFetch<Denomination>(`/denominations/${denomId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteDenomination(denomId: string): Promise<void> {
  await apiFetch<{ message: string }>(`/denominations/${denomId}`, {
    method: 'DELETE',
  });
}

// ── Hostels API ─────────────────────────────────────────────────────────────

export interface Hostel {
  id: number;
  name: string;
}

export async function fetchHostels(): Promise<Hostel[]> {
  return apiFetch<Hostel[]>('/hostels');
}

export async function createHostel(name: string): Promise<Hostel> {
  return apiFetch<Hostel>('/hostels', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteHostel(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/hostels/${id}`, {
    method: 'DELETE',
  });
}

// ── Courses API ─────────────────────────────────────────────────────────────

export interface Course {
  id: number;
  name: string;
}

export async function fetchCourses(): Promise<Course[]> {
  return apiFetch<Course[]>('/courses');
}

export async function createCourse(name: string): Promise<Course> {
  return apiFetch<Course>('/courses', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteCourse(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/courses/${id}`, {
    method: 'DELETE',
  });
}
