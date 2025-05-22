import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { LessonService, Lesson } from '../../services/lessons.service';
import { AuthService } from '../../services/auth.service';
import { LessonListComponent } from '../../components/lesson-list/lesson-list.component';
import { LessonCreationComponent } from '../../components/lesson-creation/lesson-creation.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [
    CommonModule,
    MATERIAL_IMPORTS,
    MatTabsModule,
    LessonListComponent,
    LessonCreationComponent
  ],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
})
export class LessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  isTeacher = false;
  loading = true;

  constructor(
    private lessonService: LessonService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        this.loadLessons();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.isTeacher = false;
        this.loadLessons();
      }
    });
  }

  loadLessons(): void {
    this.loading = true;
    this.lessonService.getLessons().subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading lessons:', err);
        this.loading = false;
      }
    });
  }

  onLessonCreated(lesson: Lesson): void {
    // Reload the lessons or add the new lesson to the list
    this.loadLessons();
  }
}
