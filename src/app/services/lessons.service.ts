import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Lesson {
  id?: number;
  name: string;
  lesson_type: string;
  jlpt_level: string | number; // Can be a number or range like "3-5"
  exercise_count: number;
  teacher?: any; // Teacher object
}

export interface LessonExercise {
  id?: number;
  lesson: number;
  exercise_id: number;
  exercise_type: string; // 'freetext', 'multi-choice', or 'pair-match'
}

export interface Exercise {
  id?: number;
  type: string;
  jlpt_level: number;
  question?: string;
  answer?: string;
  kanji?: string;
  meaning?: string;
  options?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private baseUrl = 'http://127.0.0.1:8000/api/lessons/';

  constructor(private http: HttpClient) {}

  // Get all lessons
  getLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error fetching lessons:', error);
        return of([]);
      })
    );
  }

  // Get a specific lesson
  getLesson(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.baseUrl}${id}/`);
  }

  // Create a new lesson
  createLesson(lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(this.baseUrl, lesson);
  }

  // Get exercises for a lesson
  getLessonExercises(lessonId: number): Observable<Exercise[]> {
    return this.http.get<LessonExercise[]>(`${this.baseUrl}${lessonId}/exercises/`).pipe(
      map(lessonExercises => {
        // Since we need to get the actual exercise details, we'll need to fetch each one
        // This is a placeholder - actual implementation will depend on your backend API
        const exercises: Exercise[] = [];
        return exercises;
      }),
      catchError(error => {
        console.error(`Error fetching exercises for lesson ${lessonId}:`, error);
        return of([]);
      })
    );
  }

  // Add exercises to a lesson
  addExercisesToLesson(lessonId: number, exercises: {id: number, type: string}[]): Observable<any> {
    const lessonExercises = exercises.map(exercise => ({
      lesson: lessonId,
      exercise_id: exercise.id,
      exercise_type: exercise.type
    }));
    return this.http.post(`${this.baseUrl}${lessonId}/exercises/`, lessonExercises);
  }

  // Helper method to determine lesson type based on exercises
  determineLessonType(exercises: {type: string}[]): string {
    if (exercises.length === 0) return 'unknown';

    const types = new Set(exercises.map(e => e.type));
    if (types.size === 1) {
      return Array.from(types)[0];
    } else {
      return 'mixed';
    }
  }

  // Helper method to determine JLPT level range based on exercises
  determineJlptLevelRange(exercises: {jlpt_level: number}[]): string {
    if (exercises.length === 0) return 'unknown';

    const levels = exercises.map(e => e.jlpt_level);
    const minLevel = Math.min(...levels);
    const maxLevel = Math.max(...levels);

    if (minLevel === maxLevel) {
      return minLevel.toString();
    } else {
      return `${minLevel}-${maxLevel}`;
    }
  }

  // Get all exercises (for lesson creation)
  getAllExercises(): Observable<{freetext: any[], multiChoice: any[], pairMatch: any[]}> {
    // This would fetch all exercise types from their respective endpoints
    const freetextObservable = this.http.get<any[]>('http://127.0.0.1:8000/api/exercise-freetext/').pipe(
      map(exercises => exercises.map(e => ({...e, type: 'freetext'}))),
      catchError(error => {
        console.error('Error fetching freetext exercises:', error);
        return of([]);
      })
    );

    const multiChoiceObservable = this.http.get<any[]>('http://127.0.0.1:8000/api/exercise-multichoice/').pipe(
      map(exercises => exercises.map(e => ({...e, type: 'multi-choice'}))),
      catchError(error => {
        console.error('Error fetching multi-choice exercises:', error);
        return of([]);
      })
    );

    const pairMatchObservable = this.http.get<any[]>('http://127.0.0.1:8000/api/exercise-match/').pipe(
      map(exercises => exercises.map(e => ({...e, type: 'pair-match'}))),
      catchError(error => {
        console.error('Error fetching pair-match exercises:', error);
        return of([]);
      })
    );

    return forkJoin({
      freetext: freetextObservable,
      multiChoice: multiChoiceObservable,
      pairMatch: pairMatchObservable
    });
  }
}
