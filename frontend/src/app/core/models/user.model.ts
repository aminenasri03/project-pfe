export type Role = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
}

/** Shape returned by the backend POST /api/auth/login */
export interface AuthResponse {
  token: string;
  expiresIn: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}
