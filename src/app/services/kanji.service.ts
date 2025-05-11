import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface KanjiData {
  kanji: string;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  jlpt?: number;
  stroke_count: number;
  freq_mainichi_shinbun?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class KanjiService {
  private apiUrl = 'https://kanjiapi.dev/v1/kanji/';

  constructor(private http: HttpClient) {}

  getRandomKanji(): Observable<KanjiData> {
    const jlptUrl = 'https://kanjiapi.dev/v1/kanji/grade-1';
    return this.http.get<string[]>(jlptUrl).pipe(
      map(kanjiList => kanjiList[Math.floor(Math.random() * kanjiList.length)]),
      switchMap(randomKanji => this.http.get<KanjiData>(`${this.apiUrl}${randomKanji}`))
    );
  }

  getKanjiByJLPT(level: number): Observable<string[]> {
    return this.http.get<string[]>(`https://kanjiapi.dev/v1/kanji/jlpt-${level}`);
  }

  getKanjiDetails(character: string): Observable<KanjiData> {
    return this.http.get<KanjiData>(`${this.apiUrl}${character}`);
  }
}
