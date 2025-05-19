import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {forkJoin, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

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
  private apiUrl = 'http://127.0.0.1:8000/api/exercise-match/';
  private optionsUrl = 'http://127.0.0.1:8000/api/exercise-match-options/';

  constructor(private http: HttpClient) {}

  getMatches(): Observable<ExerciseMatch[]> {
    return this.http.get<ExerciseMatch[]>(this.apiUrl);
  }

  // Add a single match
  addMatch(match: ExerciseMatch): Observable<ExerciseMatch> {
    return this.http.post<ExerciseMatch>(this.apiUrl, match);
  }

  // Delete a match by ID
  deleteMatch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  // Get all match options
  getMatchOptions(): Observable<ExerciseMatchOption[]> {
    return this.http.get<ExerciseMatchOption[]>(this.optionsUrl);
  }

  // Add a single match option
  addMatchOption(option: ExerciseMatchOption): Observable<ExerciseMatchOption> {
    return this.http.post<ExerciseMatchOption>(this.optionsUrl, option);
  }

  // Delete a match option by ID
  deleteMatchOption(id: number): Observable<any> {
    return this.http.delete(`${this.optionsUrl}${id}/`);
  }

  // Create match with multiple options in one operation
  createMatchWithOptions(jlptLevel: number, pairs: {kanji: string, answer: string}[]): Observable<any> {
    // First create the match
    return this.http.post<ExerciseMatch>(this.apiUrl, { jlpt_level: jlptLevel }).pipe(
      switchMap(match => {
        if (pairs.length === 0) {
          return forkJoin([]); // No options to create
        }

        // Then create all the options for this match
        const optionRequests = pairs.map(pair => {
          const option: ExerciseMatchOption = {
            exercise_match: match.id!,
            kanji: pair.kanji,
            answer: pair.answer
          };
          return this.addMatchOption(option);
        });

        return forkJoin(optionRequests);
      })
    );
  }

  // Check if a pair already exists in any match option
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
}
