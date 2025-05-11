import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DictionaryService {
  private baseUrl = 'https://jotoba.de/api/search';

  constructor(private http: HttpClient) {}

  search(query: string, type: 'words' | 'kanji', language: 'English' | 'Japanese' = 'English'): Observable<any> {
    const url = `${this.baseUrl}/${type}`;
    const body = {
      query,
      language
    };
    return this.http.post<any>(url, body);
  }
}
