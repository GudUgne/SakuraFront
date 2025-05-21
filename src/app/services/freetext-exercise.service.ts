// src/app/services/freetext-exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FreetextExerciseService {
  private baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  // Exercise management
  getExercises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}exercise-freetext/`);
  }

  getExerciseById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}exercise-freetext/${id}/`);
  }

  createExercise(exercise: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}exercise-freetext/`, exercise);
  }

  updateExercise(id: number, exercise: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}exercise-freetext/${id}/`, exercise);
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}exercise-freetext/${id}/`);
  }

  // Submission management
  submitAnswer(submission: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}freetext-submission/`, submission);
  }

  getStudentSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}freetext-submission/`);
  }

  getPendingSubmissions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}freetext-pending/`);
  }

  reviewSubmission(id: number, reviewData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}freetext-submission/${id}/`, reviewData);
  }
}
