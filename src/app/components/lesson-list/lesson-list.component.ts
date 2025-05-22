import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { LessonService, Lesson } from '../../services/lessons.service';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MATERIAL_IMPORTS
  ],
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.css']
})
export class LessonListComponent implements OnInit {
  @Input() lessons: Lesson[] = [];
  @Input() isTeacher = false;

  filteredLessons: Lesson[] = [];
  searchTerm = '';
  typeFilter = 'all';
  jlptFilter = 'all';

  constructor(
    private lessonService: LessonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.filteredLessons = [...this.lessons];
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredLessons = this.lessons.filter(lesson => {
      let matchesSearch = true;
      let matchesType = true;
      let matchesJlpt = true;

      // Apply search filter
      if (this.searchTerm) {
        matchesSearch = lesson.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      }

      // Apply type filter
      if (this.typeFilter !== 'all') {
        matchesType = lesson.lesson_type === this.typeFilter;
      }

      // Apply JLPT filter
      if (this.jlptFilter !== 'all') {
        if (typeof lesson.jlpt_level === 'number') {
          matchesJlpt = lesson.jlpt_level.toString() === this.jlptFilter;
        } else if (typeof lesson.jlpt_level === 'string') {
          // Handle range like "3-5"
          const range = lesson.jlpt_level.split('-').map(Number);
          if (range.length === 2) {
            const jlptLevel = parseInt(this.jlptFilter);
            matchesJlpt = jlptLevel >= range[0] && jlptLevel <= range[1];
          } else {
            matchesJlpt = lesson.jlpt_level === this.jlptFilter;
          }
        }
      }

      return matchesSearch && matchesType && matchesJlpt;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  onJlptFilterChange(): void {
    this.applyFilters();
  }

  viewLesson(lesson: Lesson): void {
    if (lesson.id) {
      this.router.navigate(['/app/lessons', lesson.id]);
    }
  }

  editLesson(lesson: Lesson): void {
    if (lesson.id) {
      this.router.navigate(['/app/lessons/edit', lesson.id]);
    }
  }

  deleteLesson(lesson: Lesson): void {
    if (!lesson.id) return;

    if (confirm(`Are you sure you want to delete the lesson "${lesson.name}"?`)) {
      // Implement the delete functionality
      // This would typically call a service method
      console.log('Deleting lesson', lesson.id);

      // After deleting, refresh the list
      // For now, we'll just remove it from the local array
      this.lessons = this.lessons.filter(l => l.id !== lesson.id);
      this.applyFilters();
    }
  }
}
