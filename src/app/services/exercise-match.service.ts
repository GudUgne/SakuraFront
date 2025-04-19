import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExerciseMatch {
  id?: number;
  jlpt_level: number;
  kanji: string;
  answer: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseMatchService {
  private apiUrl = 'http://127.0.0.1:8000/api/exercise-match/';

  constructor(private http: HttpClient) {}

  // Save one kanji–meaning pair
  addMatch(match: ExerciseMatch): Observable<ExerciseMatch> {
    return this.http.post<ExerciseMatch>(this.apiUrl, match);
  }

  // Get all pairs from backend (optional for listing later)
  getMatches(): Observable<ExerciseMatch[]> {
    return this.http.get<ExerciseMatch[]>(this.apiUrl);
  }

  // Optional: delete by ID
  deleteMatch(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
