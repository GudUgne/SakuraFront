import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, switchMap, map, forkJoin } from 'rxjs';

export interface ExerciseMatch {
  id?: number;
  jlpt_level: number;
  kanji?: string;
  answer?: string;
  options?: ExerciseMatchOption[];
}

export interface ExerciseMatchOption {
  id?: number;
  exercise_match: number;
  kanji: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseMatchService {
  private matchUrl = 'http://127.0.0.1:8000/api/exercise-match/';
  private optionsUrl = 'http://127.0.0.1:8000/api/exercise-match-options/';

  constructor(private http: HttpClient) {}

  // Get all matches with their options
  getMatches(): Observable<ExerciseMatch[]> {
    return this.http.get<ExerciseMatch[]>(this.matchUrl).pipe(
      switchMap(matches => {
        if (matches.length === 0) {
          return of([]);
        }

        // Get all options
        return this.getAllMatchOptions().pipe(
          map(options => {
            // Group options by match_id
            const optionsByMatch = options.reduce((acc, option) => {
              if (!acc[option.exercise_match]) {
                acc[option.exercise_match] = [];
              }
              acc[option.exercise_match].push(option);
              return acc;
            }, {} as Record<number, ExerciseMatchOption[]>);

            // Attach options to matches
            return matches.map(match => {
              const matchOptions = optionsByMatch[match.id!] || [];
              // Add the first option's kanji and answer directly to the match for display
              if (matchOptions.length > 0) {
                return {
                  ...match,
                  kanji: matchOptions[0].kanji,
                  answer: matchOptions[0].answer,
                  options: matchOptions
                };
              }
              return {
                ...match,
                options: []
              };
            });
          })
        );
      })
    );
  }

  // Add a match entry
  addMatch(match: ExerciseMatch): Observable<ExerciseMatch> {
    return this.http.post<ExerciseMatch>(this.matchUrl, match);
  }

  // Get all match options
  getAllMatchOptions(): Observable<ExerciseMatchOption[]> {
    return this.http.get<ExerciseMatchOption[]>(this.optionsUrl);
  }

  // Add a match option
  addMatchOption(option: ExerciseMatchOption): Observable<ExerciseMatchOption> {
    return this.http.post<ExerciseMatchOption>(this.optionsUrl, option);
  }

  // Delete a match by ID
  deleteMatch(id: number): Observable<any> {
    return this.http.delete(`${this.matchUrl}${id}/`);
  }
}
