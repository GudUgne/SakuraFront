// theme.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkThemeClass = 'dark-theme';

  constructor() {
    const isDark = localStorage.getItem('isDarkTheme') === 'true';
    this.applyTheme(isDark);
  }

  toggleTheme(isDark: boolean): void {
    localStorage.setItem('isDarkTheme', isDark.toString());
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add(this.darkThemeClass);
    } else {
      body.classList.remove(this.darkThemeClass);
    }
  }

  isDarkTheme(): boolean {
    return document.body.classList.contains(this.darkThemeClass);
  }
}
