import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupsService {
  private baseUrl = '/api/groups/';

  constructor(private http: HttpClient) {}

  getMyGroups(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  createGroup(name: string): Observable<any> {
    return this.http.post(this.baseUrl + 'create/', { name });
  }

  requestToJoin(groupId: number): Observable<any> {
    return this.http.post(this.baseUrl + `${groupId}/request/`, {});
  }

  getPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'requests/');
  }

  approveStudent(groupId: number, studentId: number): Observable<any> {
    return this.http.post(this.baseUrl + `${groupId}/approve/${studentId}/`, {});
  }
}
