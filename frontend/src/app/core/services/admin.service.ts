import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { User, Role } from '../models/user.model';

interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
}

interface UserPage {
  content: UserDto[];
  totalElements: number;
}

function toUser(dto: UserDto): User {
  const rawRole = dto.roles?.[0] ?? 'ROLE_CANDIDATE';
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    enabled: dto.enabled,
    role: rawRole.replace('ROLE_', '') as Role,
    createdAt: dto.createdAt
  };
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http
      .get<UserPage>(`${this.base}/admin/users?size=100&sort=createdAt,asc`)
      .pipe(map(page => page.content.map(toUser)));
  }

  setUserEnabled(id: number, enabled: boolean) {
    return this.http
      .patch<UserDto>(`${this.base}/admin/users/${id}`, null, { params: { enabled: String(enabled) } })
      .pipe(map(toUser));
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.base}/admin/users/${id}`);
  }

  addRole(userId: number, role: string) {
    return this.http.post<UserDto>(`${this.base}/admin/users/${userId}/roles/${role}`, null)
      .pipe(map(toUser));
  }

  removeRole(userId: number, role: string) {
    return this.http.delete<UserDto>(`${this.base}/admin/users/${userId}/roles/${role}`)
      .pipe(map(toUser));
  }
}
