import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthRequest, LoginResponse, RegisterResponse } from '../../../core/models/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly DUMMY_USERNAME = 'example';
  private readonly API_URI = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(payload: AuthRequest): Observable<{ token: string }> {
    return this.http.post<LoginResponse>(`${this.API_URI}/login/`, payload).pipe(
      tap((response) => {
        if (response && response?.token) {
          localStorage.setItem('token', response.token);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  register(payload: AuthRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URI}/register/`, payload);
  }
}
