import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Prompt, Tag } from '../../../core/models/prompt.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  private readonly http = inject(HttpClient);

  private readonly API_URI = environment.apiUrl;

  getPrompts(tag: Tag | null = null): Observable<Prompt[]> {
    let params = new HttpParams();

    if (tag) params = params.set('tag', tag);

    return this.http.get<Prompt[]>(`${this.API_URI}/prompts`, { params });
  }

  getPromptById(id: string): Observable<Prompt> {
    return this.http.get<Prompt>(`${this.API_URI}/prompts/` + id);
  }

  createPrompt(payload: Partial<Prompt>): Observable<Prompt> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<Prompt>(`${this.API_URI}/prompts/`, payload, { headers });
  }
}
