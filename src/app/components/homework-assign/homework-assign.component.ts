import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { HomeworkService, HomeworkAssignment } from '../../services/homework.service';
import { LessonService, Lesson } from '../../services/lessons.service';
import { GroupsService, GroupOverview } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-homework-assign',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MATERIAL_IMPORTS
  ],
  templateUrl: './homework-assign.component.html',
  styleUrls: ['./homework-assign.component.css']
})
export class HomeworkAssignComponent implements OnInit {
  @Output() homeworkAssigned = new EventEmitter<void>();
  @Output() dialogClosed = new EventEmitter<void>();

  assignForm: FormGroup;
  lessons: Lesson[] = [];
  groups: GroupOverview[] = [];

  loading = false;
  submitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private homeworkService: HomeworkService,
    private lessonService: LessonService,
    private groupsService: GroupsService,
    private authService: AuthService
  ) {
    this.assignForm = this.fb.group({
      lesson_id: ['', Validators.required],
      group_id: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.setDefaultDates();
  }

  loadData(): void {
    this.loading = true;

    // Load lessons and groups in parallel
    Promise.all([
      this.lessonService.getLessons().toPromise(),
      this.groupsService.getMyGroups().toPromise()
    ]).then(([lessons, groups]) => {
      this.lessons = lessons || [];
      this.groups = groups || [];
      this.loading = false;
    }).catch(err => {
      console.error('Error loading data:', err);
      this.errorMessage = 'Failed to load lessons and groups';
      this.loading = false;
    });
  }

  setDefaultDates(): void {
    const now = new Date();

    // Default start date: now
    const startDate = new Date(now);

    // Default end date: 7 days from now
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);

    this.assignForm.patchValue({
      start_date: this.formatDateForInput(startDate),
      end_date: this.formatDateForInput(endDate)
    });
  }

  formatDateForInput(date: Date): string {
    // Format: YYYY-MM-DDTHH:MM (for datetime-local input)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    // Validate dates
    const startDate = new Date(this.assignForm.value.start_date);
    const endDate = new Date(this.assignForm.value.end_date);

    if (endDate <= startDate) {
      this.errorMessage = 'End date must be after start date';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const assignment: HomeworkAssignment = {
      lesson_id: this.assignForm.value.lesson_id,
      group_id: this.assignForm.value.group_id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    };

    this.homeworkService.assignHomework(assignment).subscribe({
      next: () => {
        this.submitting = false;
        this.homeworkAssigned.emit();
      },
      error: (err) => {
        console.error('Error assigning homework:', err);
        this.errorMessage = err.error?.detail || 'Failed to assign homework';
        this.submitting = false;
      }
    });
  }

  closeDialog(): void {
    this.dialogClosed.emit();
  }

  getSelectedLesson(): Lesson | null {
    const lessonId = this.assignForm.value.lesson_id;
    return this.lessons.find(lesson => lesson.id === lessonId) || null;
  }

  getSelectedGroup(): GroupOverview | null {
    const groupId = this.assignForm.value.group_id;
    return this.groups.find(group => group.id === groupId) || null;
  }

  getTeacherName(group: GroupOverview | null): string {
    if (!group?.teacher) return 'Unknown Teacher';
    return `${group.teacher.first_name || ''} ${group.teacher.last_name || ''}`.trim();
  }

  // Helper method to format lesson type for display
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
