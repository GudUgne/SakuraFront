import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Homework {
  id?: number;
  lesson: {
    id: number;
    name: string;
    lesson_type: string;
    jlpt_level: string | number;
    exercise_count: number;
  };
  teacher: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  group: {
    id: number;
    name: string;
  };
  start_date: string;
  end_date: string;
}

export interface HomeworkResult {
  id?: number;
  homework: number;
  student: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  score: number;
  completed_date?: string;
}

export interface HomeworkAssignment {
  lesson_id: number;
  group_id: number;
  start_date: string;
  end_date: string;
}

export interface HomeworkOverview {
  homework: Homework;
  total_students: number;
  completed_count: number;
  completion_rate: number;
  average_score: number;
  results: HomeworkResult[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeworkService {
  private baseUrl = 'http://127.0.0.1:8000/api/homework/';

  constructor(private http: HttpClient) {}

  // Teacher methods
  assignHomework(assignment: HomeworkAssignment): Observable<Homework> {
    return this.http.post<Homework>(`${this.baseUrl}assign/`, assignment).pipe(
      catchError(error => {
        console.error('Error assigning homework:', error);
        throw error;
      })
    );
  }

  getTeacherHomework(): Observable<Homework[]> {
    return this.http.get<Homework[]>(`${this.baseUrl}teacher/`).pipe(
      catchError(error => {
        console.error('Error fetching teacher homework:', error);
        return of([]);
      })
    );
  }

  getHomeworkOverview(homeworkId: number): Observable<HomeworkOverview> {
    return this.http.get<HomeworkOverview>(`${this.baseUrl}${homeworkId}/overview/`).pipe(
      catchError(error => {
        console.error('Error fetching homework overview:', error);
        throw error;
      })
    );
  }

  deleteHomework(homeworkId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${homeworkId}/`).pipe(
      catchError(error => {
        console.error('Error deleting homework:', error);
        throw error;
      })
    );
  }

  // Student methods
  getStudentHomework(): Observable<Homework[]> {
    return this.http.get<Homework[]>(`${this.baseUrl}student/`).pipe(
      catchError(error => {
        console.error('Error fetching student homework:', error);
        return of([]);
      })
    );
  }

  submitHomeworkResult(homeworkId: number, score: number): Observable<HomeworkResult> {
    return this.http.post<HomeworkResult>(`${this.baseUrl}${homeworkId}/submit/`, { score }).pipe(
      catchError(error => {
        console.error('Error submitting homework result:', error);
        throw error;
      })
    );
  }

  getHomeworkResult(homeworkId: number): Observable<HomeworkResult | null> {
    return this.http.get<HomeworkResult>(`${this.baseUrl}${homeworkId}/result/`).pipe(
      catchError(error => {
        console.error('Error fetching homework result:', error);
        return of(null);
      })
    );
  }

  // Helper methods
  isHomeworkOverdue(endDate: string): boolean {
    return new Date() > new Date(endDate);
  }

  isHomeworkActive(startDate: string, endDate: string): boolean {
    const now = new Date();
    return now >= new Date(startDate) && now <= new Date(endDate);
  }

  getHomeworkStatus(homework: Homework, result?: HomeworkResult): 'not_started' | 'in_progress' | 'completed' | 'overdue' {
    if (result) {
      return 'completed';
    }

    const now = new Date();
    const startDate = new Date(homework.start_date);
    const endDate = new Date(homework.end_date);

    if (now < startDate) {
      return 'not_started';
    } else if (now > endDate) {
      return 'overdue';
    } else {
      return 'in_progress';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDaysRemaining(endDate: string): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
