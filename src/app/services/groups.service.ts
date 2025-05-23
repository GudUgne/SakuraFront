import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GroupOverview {
  id: number;
  name: string;
  teacher: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  verification_status: boolean;
}

export interface GroupDetail {
  id: number;
  name: string;
  students: Student[];
}

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private baseUrl = 'http://127.0.0.1:8000/api/groups/';

  constructor(private http: HttpClient) {}

  getMyGroups(): Observable<GroupOverview[]> {
    return this.http.get<GroupOverview[]>(this.baseUrl);
  }

  searchGroups(query: string): Observable<GroupOverview[]> {
    return this.http.get<GroupOverview[]>(`${this.baseUrl}search/?name=${encodeURIComponent(query)}`);
  }

  createGroup(name: string): Observable<GroupOverview> {
    return this.http.post<GroupOverview>(`${this.baseUrl}create/`, { name });
  }

  requestToJoin(groupId: number): Observable<{ detail: string }> {
    return this.http.post<{ detail: string }>(
      `${this.baseUrl}${groupId}/request/`,
      {}
    );
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}requests/`);
  }

  approveStudent(groupId: number, studentId: number): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}${groupId}/approve/${studentId}/`,
      {}
    );
  }

  cancelStudentRequest(groupId: number, requestId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}${groupId}/requests/${requestId}/`
    );
  }

  withdrawRequest(groupId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}${groupId}/request/`
    );
  }

  getStudentPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}my-pending-requests/`);
  }

  getGroupDetail(groupId: number): Observable<GroupDetail> {
    return this.http.get<GroupDetail>(`${this.baseUrl}${groupId}/`);
  }

  removeStudent(groupId: number, studentId: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}${groupId}/students/${studentId}/`
    );
  }
}
