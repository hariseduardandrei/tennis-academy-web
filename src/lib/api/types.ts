// DTO types mirroring the backend API contract

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface MeResponse {
  id: string;
  email: string;
  role: 'ADMIN' | 'COACH' | 'TRAINER' | 'STUDENT';
  language: string;
}

// Courts
export interface CourtDto {
  id: number;
  name: string;
}

// Sessions
export type SessionType = 'TENNIS' | 'FITNESS' | 'MATCHPLAY';

export interface SessionStudentInfo {
  id: string;
  firstName: string;
  lastName: string;
}

export interface SessionCourtInfo {
  id: number;
  name: string;
}

export interface SessionStaffInfo {
  id: string;
  email: string;
}

export interface SessionDto {
  id: string;
  startAt: string;
  endAt: string;
  court: SessionCourtInfo;
  staffUser: SessionStaffInfo;
  sessionType: SessionType;
  title?: string;
  students: SessionStudentInfo[];
  createdBy: SessionStaffInfo;
  updatedAt: string;
}

export interface CreateSessionRequest {
  startAt: string;
  endAt: string;
  courtId: number;
  staffUserId: string;
  sessionType: SessionType;
  title?: string;
  studentIds?: string[];
}

export interface PatchSessionRequest {
  startAt?: string;
  endAt?: string;
  courtId?: number;
  staffUserId?: string;
  sessionType?: SessionType;
  title?: string;
}

export interface ReplaceStudentsRequest {
  studentIds: string[];
}

// Session Metrics
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

export interface SessionMetricItem {
  studentId: string;
  firstName: string;
  lastName: string;
  attendanceStatus: AttendanceStatus;
  durationMinutes: number;
  rpe?: number;
  load?: number;
  internalNotes?: string;
  studentNotes?: string;
}

export interface SessionMetricsResponse {
  sessionId: string;
  items: SessionMetricItem[];
}

export interface CompleteSessionItemRequest {
  studentId: string;
  attendanceStatus: AttendanceStatus;
  durationMinutes?: number;
  rpe?: number;
  internalNotes?: string;
  studentNotes?: string;
}

export interface CompleteSessionRequest {
  items: CompleteSessionItemRequest[];
}

// Students
export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export interface StudentDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  status: StudentStatus;
  notes?: string;
  userId?: string;
  createdAt: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  status?: StudentStatus;
  notes?: string;
}

export interface PatchStudentRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  status?: StudentStatus;
  notes?: string;
}

export interface CreateAccountResponse {
  userId: string;
  temporaryPassword: string;
}

// Billing
export type MembershipStatus = 'PAID' | 'DUE' | 'WAIVED';

export interface BillingStudentRow {
  studentId: string;
  firstName: string;
  lastName: string;
  membershipId?: string;
  status: MembershipStatus;
  amount?: number;
  dueDate?: string;
  paidAt?: string;
}

export interface BillingMonthResponse {
  year: number;
  month: number;
  rows: BillingStudentRow[];
}

export interface PatchMembershipRequest {
  status: MembershipStatus;
  amount?: number;
}

// Student portal
export interface MyScheduleSessionResponse {
  sessionId: string;
  startAt: string;
  endAt: string;
  courtName: string;
  staffName: string;
  sessionType: SessionType;
  title?: string;
}

export interface MyScheduleWeekResponse {
  sessions: MyScheduleSessionResponse[];
}

export interface MyHistoryItemResponse {
  sessionId: string;
  startAt: string;
  endAt: string;
  courtName: string;
  staffName: string;
  sessionType: SessionType;
  title?: string;
  attendanceStatus?: AttendanceStatus;
  durationMinutes?: number;
  rpe?: number;
  load?: number;
  studentNotes?: string;
}

export interface MyHistoryResponse {
  items: MyHistoryItemResponse[];
  total: number;
}

// Staff users
export interface StaffUserDto {
  id: string;
  email: string;
  role: 'ADMIN' | 'COACH' | 'TRAINER';
}

