import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { HomeworkService, Homework, HomeworkResult } from '../../services/homework.service';
import { AuthService } from '../../services/auth.service';
import { HomeworkAssignComponent } from '../../components/homework-assign/homework-assign.component';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-homework',
  standalone: true,
  imports: [
    CommonModule,
    MATERIAL_IMPORTS,
    HomeworkAssignComponent
  ],
  templateUrl: './homework.component.html',
  styleUrls: ['./homework.component.css']
})
export class HomeworkComponent implements OnInit {
  isTeacher = false;
  loading = true;

  // Teacher data
  teacherHomework: Homework[] = [];

  // Student data
  studentHomework: Homework[] = [];
  homeworkResults: Map<number, HomeworkResult> = new Map();

  // UI state
  selectedTab = 0;
  showAssignDialog = false;

  constructor(
    private homeworkService: HomeworkService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        this.loadHomeworkData();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.loading = false;
      }
    });
  }

  loadHomeworkData(): void {
    this.loading = true;

    if (this.isTeacher) {
      this.loadTeacherHomework();
    } else {
      this.loadStudentHomework();
    }
  }

  loadTeacherHomework(): void {
    this.homeworkService.getTeacherHomework().subscribe({
      next: (homework) => {
        this.teacherHomework = homework;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading teacher homework:', err);
        this.loading = false;
      }
    });
  }

  loadStudentHomework(): void {
    this.homeworkService.getStudentHomework().pipe(
      switchMap(homework => {
        this.studentHomework = homework;

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
          if (result && this.studentHomework[index]) {
            this.homeworkResults.set(this.studentHomework[index].id!, result);
          }
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading student homework:', err);
        this.loading = false;
      }
    });
  }

  // Teacher methods
  openAssignDialog(): void {
    this.showAssignDialog = true;
  }

  closeAssignDialog(): void {
    this.showAssignDialog = false;
  }

  onHomeworkAssigned(): void {
    this.closeAssignDialog();
    this.loadTeacherHomework();
  }

  viewHomeworkOverview(homework: Homework): void {
    this.router.navigate(['/app/homework/overview', homework.id]);
  }

  deleteHomework(homework: Homework): void {
    if (!homework.id) return;

    const confirmMessage = `Are you sure you want to delete the homework "${homework.lesson.name}" for ${homework.group.name}?`;

    if (confirm(confirmMessage)) {
      this.homeworkService.deleteHomework(homework.id).subscribe({
        next: () => {
          this.teacherHomework = this.teacherHomework.filter(hw => hw.id !== homework.id);
        },
        error: (err) => {
          console.error('Error deleting homework:', err);
          alert('Failed to delete homework. Please try again.');
        }
      });
    }
  }

  // Student methods
  startHomework(homework: Homework): void {
    if (!homework.id) return;

    // Navigate to lesson-taking component with homework context
    this.router.navigate(['/app/lessons', homework.lesson.id, 'take'], {
      queryParams: { homework: homework.id }
    });
  }

  viewHomeworkResult(homework: Homework): void {
    const result = this.homeworkResults.get(homework.id!);
    if (result) {
      // Could navigate to a detailed result view
      alert(`Your score: ${result.score}%`);
    }
  }

  // Helper methods
  getHomeworkStatus(homework: Homework): 'not_started' | 'in_progress' | 'completed' | 'overdue' {
    const result = this.homeworkResults.get(homework.id!);
    return this.homeworkService.getHomeworkStatus(homework, result);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'accent';
      case 'in_progress': return 'primary';
      case 'overdue': return 'warn';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'overdue': return 'Overdue';
      case 'not_started': return 'Not Started';
      default: return 'Unknown';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'in_progress': return 'access_time';
      case 'overdue': return 'warning';
      case 'not_started': return 'schedule';
      default: return 'help';
    }
  }

  formatDate(dateString: string): string {
    return this.homeworkService.formatDate(dateString);
  }

  getDaysRemaining(homework: Homework): number {
    return this.homeworkService.getDaysRemaining(homework.end_date);
  }

  isHomeworkActive(homework: Homework): boolean {
    return this.homeworkService.isHomeworkActive(homework.start_date, homework.end_date);
  }

  canStartHomework(homework: Homework): boolean {
    const status = this.getHomeworkStatus(homework);
    return status === 'in_progress' && !this.homeworkResults.has(homework.id!);
  }

  getHomeworkScore(homework: Homework): number | null {
    const result = this.homeworkResults.get(homework.id!);
    return result ? result.score : null;
  }
}
