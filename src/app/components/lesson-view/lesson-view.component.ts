import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { LessonService, Lesson } from '../../services/lessons.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lesson-view',
  standalone: true,
  imports: [CommonModule, MATERIAL_IMPORTS],
  templateUrl: './lesson-view.component.html',
  styleUrls: ['./lesson-view.component.css']
})
export class LessonViewComponent implements OnInit {
  lesson: Lesson | null = null;
  loading = true;
  isTeacher = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: LessonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is teacher
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        if (!this.isTeacher) {
          // Redirect non-teachers back to lessons
          this.router.navigate(['/app/lessons']);
          return;
        }

        // Load lesson if user is teacher
        const lessonId = Number(this.route.snapshot.paramMap.get('id'));
        if (lessonId && !isNaN(lessonId)) {
          this.loadLesson(lessonId);
        } else {
          console.error('Invalid lesson ID');
          this.router.navigate(['/app/lessons']);
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.router.navigate(['/app/lessons']);
      }
    });
  }

  loadLesson(id: number): void {
    this.lessonService.getLesson(id).subscribe({
      next: (lesson) => {
        this.lesson = lesson;
        console.log('Loaded lesson:', lesson); // Debug log
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading lesson:', err);
        this.loading = false;
        // Optionally redirect back on error
        this.router.navigate(['/app/lessons']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/lessons']);
  }

  // Helper method to get option letter (A, B, C, D)
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Helper method to format lesson type
  formatLessonType(lessonType: string): string {
    switch (lessonType) {
      case 'freetext':
        return 'Freetext';
      case 'multi-choice':
        return 'Multiple Choice';
      case 'pair-match':
        return 'Pair Match';
      case 'mixed':
        return 'Mixed';
      default:
        return lessonType;
    }
  }

  // Helper method to format JLPT level
  formatJlptLevel(jlptLevel: string | number): string {
    if (typeof jlptLevel === 'number') {
      return `N${jlptLevel}`;
    }

    if (typeof jlptLevel === 'string') {
      if (jlptLevel.includes('-')) {
        const [min, max] = jlptLevel.split('-');
        return `N${min}-N${max}`;
      }
      return `N${jlptLevel}`;
    }

    return 'Unknown';
  }
}
