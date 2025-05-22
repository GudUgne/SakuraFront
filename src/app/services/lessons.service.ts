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
  teacher?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  exercises?: Exercise[]; // Only present in detailed view
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
  lesson_exercise_id?: number; // For removing from lesson
}

export interface AllExercisesResponse {
  freetext: any[];
  multiChoice: any[];
  pairMatch: any[];
}

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private baseUrl = 'http://127.0.0.1:8000/api/lessons/';
  private exercisesUrl = 'http://127.0.0.1:8000/api/exercises/all/';

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

  // Get a specific lesson with exercises
  getLesson(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.baseUrl}${id}/`).pipe(
      catchError(error => {
        console.error(`Error fetching lesson ${id}:`, error);
        throw error;
      })
    );
  }

  // Create a new lesson
  createLesson(lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(this.baseUrl, lesson).pipe(
      catchError(error => {
        console.error('Error creating lesson:', error);
        throw error;
      })
    );
  }

  // Update a lesson
  updateLesson(id: number, lesson: Partial<Lesson>): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.baseUrl}${id}/`, lesson).pipe(
      catchError(error => {
        console.error(`Error updating lesson ${id}:`, error);
        throw error;
      })
    );
  }

  // Delete a lesson
  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(
      catchError(error => {
        console.error(`Error deleting lesson ${id}:`, error);
        throw error;
      })
    );
  }

  // Get exercises for a lesson
  getLessonExercises(lessonId: number): Observable<LessonExercise[]> {
    return this.http.get<LessonExercise[]>(`${this.baseUrl}${lessonId}/exercises/`).pipe(
      catchError(error => {
        console.error(`Error fetching exercises for lesson ${lessonId}:`, error);
        return of([]);
      })
    );
  }

  // Add exercises to a lesson
  addExercisesToLesson(lessonId: number, exercises: {id: number, type: string}[]): Observable<LessonExercise[]> {
    const lessonExercises = exercises.map(exercise => ({
      exercise_id: exercise.id,
      exercise_type: exercise.type
    }));

    return this.http.post<LessonExercise[]>(`${this.baseUrl}${lessonId}/exercises/`, lessonExercises).pipe(
      catchError(error => {
        console.error(`Error adding exercises to lesson ${lessonId}:`, error);
        throw error;
      })
    );
  }

  // Remove an exercise from a lesson
  removeExerciseFromLesson(lessonId: number, exerciseId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${lessonId}/exercises/${exerciseId}/`).pipe(
      catchError(error => {
        console.error(`Error removing exercise ${exerciseId} from lesson ${lessonId}:`, error);
        throw error;
      })
    );
  }

  // Get all exercises (for lesson creation)
  getAllExercises(): Observable<AllExercisesResponse> {
    return this.http.get<AllExercisesResponse>(this.exercisesUrl).pipe(
      map(response => {
        // Ensure all exercises have the correct type property
        const freetext = response.freetext.map(ex => ({ ...ex, type: 'freetext' }));
        const multiChoice = response.multiChoice.map(ex => ({ ...ex, type: 'multi-choice' }));
        const pairMatch = response.pairMatch.map(ex => ({ ...ex, type: 'pair-match' }));

        return {
          freetext,
          multiChoice,
          pairMatch
        };
      }),
      catchError(error => {
        console.error('Error fetching all exercises:', error);
        return of({
          freetext: [],
          multiChoice: [],
          pairMatch: []
        });
      })
    );
  }

  // Create lesson with exercises in one call
  createLessonWithExercises(lessonData: Omit<Lesson, 'id' | 'lesson_type' | 'exercise_count'>, exercises: {id: number, type: string}[]): Observable<Lesson> {
    const lessonPayload = {
      ...lessonData,
      exercises: exercises
    };

    return this.http.post<Lesson>(this.baseUrl, lessonPayload).pipe(
      catchError(error => {
        console.error('Error creating lesson with exercises:', error);
        throw error;
      })
    );
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

  // Helper method to format lesson type for display
  formatLessonType(lessonType: string): string {
    switch (lessonType) {
      case 'freetext':
        return 'Freetext';
      case 'multi-choice':
        return 'Multiple Choice';
      case 'pair-match':
        return 'Pair Match';
      case 'mixed':
        return 'Mixed';
      default:
        return 'Unknown';
    }
  }

  // Helper method to format JLPT level for display
  formatJlptLevel(jlptLevel: string | number): string {
    if (typeof jlptLevel === 'number') {
      return `N${jlptLevel}`;
    }

    if (typeof jlptLevel === 'string') {
      if (jlptLevel.includes('-')) {
        const [min, max] = jlptLevel.split('-');
        return `N${min}-N${max}`;
      }
      return `N${jlptLevel}`;
    }

    return 'Unknown';
  }

  // Validate exercises before creating a lesson
  validateExercises(exercises: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (exercises.length === 0) {
      errors.push('At least one exercise must be selected');
    }

    // Check for required fields
    exercises.forEach((exercise, index) => {
      if (!exercise.id) {
        errors.push(`Exercise ${index + 1} is missing an ID`);
      }
      if (!exercise.type) {
        errors.push(`Exercise ${index + 1} is missing a type`);
      }
      if (!exercise.jlpt_level) {
        errors.push(`Exercise ${index + 1} is missing JLPT level`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get lesson statistics
  getLessonStats(): Observable<{
    totalLessons: number;
    lessonsByType: { [key: string]: number };
    lessonsByJlptLevel: { [key: string]: number };
    averageExerciseCount: number;
  }> {
    return this.getLessons().pipe(
      map(lessons => {
        const totalLessons = lessons.length;

        const lessonsByType: { [key: string]: number } = {};
        const lessonsByJlptLevel: { [key: string]: number } = {};
        let totalExercises = 0;

        lessons.forEach(lesson => {
          // Count by type
          lessonsByType[lesson.lesson_type] = (lessonsByType[lesson.lesson_type] || 0) + 1;

          // Count by JLPT level
          const jlptKey = this.formatJlptLevel(lesson.jlpt_level);
          lessonsByJlptLevel[jlptKey] = (lessonsByJlptLevel[jlptKey] || 0) + 1;

          // Sum exercises
          totalExercises += lesson.exercise_count;
        });

        return {
          totalLessons,
          lessonsByType,
          lessonsByJlptLevel,
          averageExerciseCount: totalLessons > 0 ? Math.round(totalExercises / totalLessons * 100) / 100 : 0
        };
      }),
      catchError(error => {
        console.error('Error calculating lesson statistics:', error);
        return of({
          totalLessons: 0,
          lessonsByType: {},
          lessonsByJlptLevel: {},
          averageExerciseCount: 0
        });
      })
    );
  }
}
