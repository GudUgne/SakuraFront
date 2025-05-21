import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface FreetextExercise {
  id?: number;
  question: string;
  answer: string;
  jlpt_level: number;
}

@Injectable({
  providedIn: 'root'
})
export class FreetextExerciseService {
  private baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  // Get all freetext exercises
  getExercises(): Observable<FreetextExercise[]> {
    return this.http.get<FreetextExercise[]>(`${this.baseUrl}exercise-freetext/`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get a specific exercise by ID
  getExercise(id: number): Observable<FreetextExercise> {
    return this.http.get<FreetextExercise>(`${this.baseUrl}exercise-freetext/${id}/`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Create a new exercise (teachers only)
  createExercise(exercise: FreetextExercise): Observable<FreetextExercise> {
    return this.http.post<FreetextExercise>(`${this.baseUrl}exercise-freetext/`, exercise)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update an existing exercise (teachers only)
  updateExercise(id: number, exercise: FreetextExercise): Observable<FreetextExercise> {
    return this.http.put<FreetextExercise>(`${this.baseUrl}exercise-freetext/${id}/`, exercise)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete an exercise (teachers only)
  deleteExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}exercise-freetext/${id}/`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Generic error handler
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
