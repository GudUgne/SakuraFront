import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { HomeworkService, Homework, HomeworkResult } from '../../services/homework.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-homework-widget',
  standalone: true,
  imports: [CommonModule, MATERIAL_IMPORTS],
  templateUrl: './homework-widget.component.html',
  styleUrls: ['./homework-widget.component.css']
})
export class HomeworkWidgetComponent implements OnInit {
  isStudent = false;
  loading = true;
  homework: Homework[] = [];
  homeworkResults: Map<number, HomeworkResult> = new Map();

  // Filtered homework lists
  urgentHomework: Homework[] = [];
  activeHomework: Homework[] = [];
  completedHomework: Homework[] = [];
  overdueHomework: Homework[] = [];

  constructor(
    private homeworkService: HomeworkService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isStudent = !user.is_teacher;
        if (this.isStudent) {
          this.loadStudentHomework();
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.loading = false;
      }
    });
  }

  loadStudentHomework(): void {
    this.loading = true;

    this.homeworkService.getStudentHomework().pipe(
      switchMap(homework => {
        this.homework = homework;

        if (homework.length === 0) {
          return of([]);
        }

        // Fetch results for each homework
        const resultRequests = homework.map(hw =>
          this.homeworkService.getHomeworkResult(hw.id!)
        );

        return forkJoin(resultRequests);
      })
    ).subscribe({
      next: (results) => {
        // Map results to homework IDs
        results.forEach((result, index) => {
          if (result && this.homework[index]) {
            this.homeworkResults.set(this.homework[index].id!, result);
          }
        });

        this.categorizeHomework();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading homework:', err);
        this.loading = false;
      }
    });
  }

  categorizeHomework(): void {
    const now = new Date();

    this.urgentHomework = [];
    this.activeHomework = [];
    this.completedHomework = [];
    this.overdueHomework = [];

    this.homework.forEach(hw => {
      const result = this.homeworkResults.get(hw.id!);
      const status = this.homeworkService.getHomeworkStatus(hw, result);
      const daysRemaining = this.homeworkService.getDaysRemaining(hw.end_date);

      if (status === 'completed') {
        this.completedHomework.push(hw);
      } else if (status === 'overdue') {
        this.overdueHomework.push(hw);
      } else if (status === 'in_progress') {
        if (daysRemaining <= 2) {
          this.urgentHomework.push(hw);
        } else {
          this.activeHomework.push(hw);
        }
      }
    });

    // Sort by due date
    const sortByDueDate = (a: Homework, b: Homework) =>
      new Date(a.end_date).getTime() - new Date(b.end_date).getTime();

    this.urgentHomework.sort(sortByDueDate);
    this.activeHomework.sort(sortByDueDate);
    this.overdueHomework.sort(sortByDueDate);
  }

  get hasUnfinishedHomework(): boolean {
    return this.urgentHomework.length > 0 ||
      this.activeHomework.length > 0 ||
      this.overdueHomework.length > 0;
  }

  get totalUnfinished(): number {
    return this.urgentHomework.length + this.activeHomework.length + this.overdueHomework.length;
  }

  goToHomework(): void {
    this.router.navigate(['/app/homework']);
  }

  startHomework(homework: Homework): void {
    if (!homework.id) return;

    this.router.navigate(['/app/lessons', homework.lesson.id, 'take'], {
      queryParams: { homework: homework.id }
    });
  }

  getHomeworkStatus(homework: Homework): 'not_started' | 'in_progress' | 'completed' | 'overdue' {
    const result = this.homeworkResults.get(homework.id!);
    return this.homeworkService.getHomeworkStatus(homework, result);
  }

  getDaysRemaining(homework: Homework): number {
    return this.homeworkService.getDaysRemaining(homework.end_date);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDueDate(homework: Homework): string {
    const daysRemaining = this.getDaysRemaining(homework);

    if (daysRemaining < 0) {
      return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''}`;
    } else if (daysRemaining === 0) {
      return 'Due today';
    } else if (daysRemaining === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${daysRemaining} days`;
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'urgent': return 'warning';
      case 'active': return 'schedule';
      case 'overdue': return 'error';
      default: return 'assignment';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'urgent': return 'warn';
      case 'active': return 'primary';
      case 'overdue': return 'warn';
      default: return '';
    }
  }
}
