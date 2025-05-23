import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { HomeworkService, HomeworkOverview } from '../../services/homework.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-homework-overview',
  standalone: true,
  imports: [
    CommonModule,
    MATERIAL_IMPORTS
  ],
  templateUrl: './homework-overview.component.html',
  styleUrls: ['./homework-overview.component.css']
})
export class HomeworkOverviewComponent implements OnInit {
  overview: HomeworkOverview | null = null;
  loading = true;
  isTeacher = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private homeworkService: HomeworkService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;

        if (!this.isTeacher) {
          // Redirect non-teachers
          this.router.navigate(['/app/homework']);
          return;
        }

        const homeworkId = Number(this.route.snapshot.paramMap.get('id'));
        if (homeworkId && !isNaN(homeworkId)) {
          this.loadHomeworkOverview(homeworkId);
        } else {
          this.router.navigate(['/app/homework']);
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.router.navigate(['/app/homework']);
      }
    });
  }

  loadHomeworkOverview(homeworkId: number): void {
    this.homeworkService.getHomeworkOverview(homeworkId).subscribe({
      next: (overview) => {
        this.overview = overview;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading homework overview:', err);
        this.loading = false;
        this.router.navigate(['/app/homework']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/homework']);
  }

  getCompletedStudents() {
    return this.overview?.results || [];
  }

  getNotCompletedStudents() {
    if (!this.overview) return [];

    const completedIds = new Set(this.overview.results.map(r => r.student.id));
    // This would need to be provided by the backend - for now return empty array
    return [];
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    return 'score-needs-work';
  }

  getScoreIcon(score: number): string {
    if (score >= 90) return 'star';
    if (score >= 70) return 'check_circle';
    return 'warning';
  }

  getCompletionRateColor(): string {
    const rate = this.overview?.completion_rate || 0;
    if (rate >= 80) return 'success';
    if (rate >= 50) return 'warning';
    return 'danger';
  }

  getAverageScoreColor(): string {
    const score = this.overview?.average_score || 0;
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  }

  formatDate(dateString: string): string {
    return this.homeworkService.formatDate(dateString);
  }

  isHomeworkOverdue(): boolean {
    if (!this.overview) return false;
    return this.homeworkService.isHomeworkOverdue(this.overview.homework.end_date);
  }

  getDaysRemaining(): number {
    if (!this.overview) return 0;
    return this.homeworkService.getDaysRemaining(this.overview.homework.end_date);
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

  exportResults(): void {
    if (!this.overview) return;

    // Create CSV content
    const headers = ['Student Name', 'Username', 'Score', 'Completion Status'];
    const csvContent = [
      headers.join(','),
      ...this.overview.results.map(result => [
        `"${result.student.first_name} ${result.student.last_name}"`,
        result.student.username,
        result.score,
        'Completed'
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `homework_results_${this.overview.homework.lesson.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
