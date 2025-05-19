import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ExerciseMatch {
  id?: number;
  jlpt_level: number;
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
  private baseUrl = 'http://127.0.0.1:8000/api/';
  private matchUrl = this.baseUrl + 'exercise-match/';
  private optionsUrl = this.baseUrl + 'exercise-match-options/';

  constructor(private http: HttpClient) {}

  // Save one kanji–meaning pair
  // addMatch(match: ExerciseMatch): Observable<ExerciseMatch> {
  //   return this.http.post<ExerciseMatch>(this.matchUrl);
  // }

  // Get all pairs from backend
  getMatches(): Observable<ExerciseMatch[]> {
    return this.http.get<ExerciseMatch[]>(this.matchUrl);
  }

  getMatchOptions(): Observable<ExerciseMatchOption[]> {
    return this.http.get<ExerciseMatchOption[]>(this.optionsUrl);
  }

  createMatchWithOptions(jlptLevel: number, pairs: {kanji: string, answer: string}[]): Observable<any> {
    // First create the match
    return this.http.post<ExerciseMatch>(this.matchUrl, { jlpt_level: jlptLevel }).pipe(
      switchMap(match => {
        // Then create all the options for this match
        const optionRequests = pairs.map(pair => {
          const option: ExerciseMatchOption = {
            exercise_match: match.id!,
            kanji: pair.kanji,
            answer: pair.answer
          };
          return this.http.post<ExerciseMatchOption>(this.optionsUrl, option);
        });

        return forkJoin(optionRequests);
      })
    );
  }

  // Check if a match already exists
  isPairDuplicate(kanji: string, answer: string): Observable<boolean> {
    return this.getMatchOptions().pipe(
      map(options => {
        return options.some(option =>
          option.kanji === kanji &&
          option.answer.toLowerCase() === answer.toLowerCase()
        );
      })
    );
  }

  // Delete a match by ID
  deleteMatch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
