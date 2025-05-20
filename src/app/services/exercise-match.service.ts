import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, forkJoin, Observable, of, tap} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

export interface ExerciseMatch {
  id?: number;
  jlpt_level: number;
  kanji?: string;
  answer?: string;
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

  private existingPairs: Set<string> = new Set();
  private initialized = false;

  constructor(private http: HttpClient) {}



  private initializeCache(): Observable<boolean> {
    if (this.initialized) {
      return of(true);
    }

    return this.getAllMatchOptions().pipe(
      tap(options => {
        // Add both directions to avoid duplicates in either order
        options.forEach(option => {
          const normalizedAnswer = option.answer.toLowerCase();
          const normalizedKanji = option.kanji.toLowerCase();
          this.existingPairs.add(`${normalizedKanji}|${normalizedAnswer}`);
          this.existingPairs.add(`${normalizedAnswer}|${normalizedKanji}`);
        });
        this.initialized = true;
      }),
      map(() => true),
      catchError(() => {
        console.error('Failed to initialize match cache');
        return of(false);
      })
    );
  }

  getAllMatchOptions(): Observable<ExerciseMatchOption[]> {
    return this.http.get<ExerciseMatchOption[]>(this.optionsUrl);
  }


  addMatch(match: ExerciseMatch): Observable<ExerciseMatch> {
    return this.initializeCache().pipe(
      switchMap(() => {
        // Check for duplicates before adding
        if (match.kanji && match.answer) {
          if (this.isDuplicate(match.kanji, match.answer)) {
            throw new Error(`Duplicate match: "${match.kanji}" and "${match.answer}"`);
          }
        }

        // First create the parent match (jlpt_level only)
        const matchData = {
          jlpt_level: match.jlpt_level
        };

        // Save the match
        return this.http.post<ExerciseMatch>(this.matchUrl, matchData).pipe(
          switchMap(savedMatch => {
            // If kanji and answer are provided, create the match option
            if (match.kanji && match.answer) {
              const option: ExerciseMatchOption = {
                exercise_match: savedMatch.id!,
                kanji: match.kanji,
                answer: match.answer
              };

              // Add to local cache to prevent duplicates
              const normalizedAnswer = match.answer.toLowerCase();
              const normalizedKanji = match.kanji.toLowerCase();
              this.existingPairs.add(`${normalizedKanji}|${normalizedAnswer}`);
              this.existingPairs.add(`${normalizedAnswer}|${normalizedKanji}`);

              // Save the option
              return this.http.post<ExerciseMatchOption>(this.optionsUrl, option).pipe(
                map(() => ({
                  ...savedMatch,
                  kanji: match.kanji,
                  answer: match.answer
                }))
              );
            }

            return of(savedMatch);
          })
        );
      }),
      catchError(err => {
        if (err.message && err.message.includes('Duplicate match')) {
          throw err; // Re-throw business logic errors
        }
        console.error('Error in addMatch:', err);
        throw err;
      })
    );
  }


  isDuplicate(kanji: string, answer: string): boolean {
    const normalizedAnswer = answer.toLowerCase();
    const normalizedKanji = kanji.toLowerCase();
    return this.existingPairs.has(`${normalizedKanji}|${normalizedAnswer}`) ||
      this.existingPairs.has(`${normalizedAnswer}|${normalizedKanji}`);
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
    return this.http.post<ExerciseMatch>(this.matchUrl, { jlpt_level: jlptLevel }).pipe(
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
              // For backward compatibility with existing components,
              // add the first option's kanji and answer directly to the match
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


  deleteMatch(id: number): Observable<any> {
    return this.http.delete(`${this.matchUrl}${id}/`).pipe(
      tap(() => {
        // Reset initialization to force a refresh of the cache on next use
        this.initialized = false;
        this.existingPairs.clear();
      })
    );
  }
}
