import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { LessonService, Lesson, Exercise } from '../../services/lessons.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lesson-creation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MATERIAL_IMPORTS,
    FormsModule
  ],
  templateUrl: './lesson-creation.component.html',
  styleUrls: ['./lesson-creation.component.css']
})
export class LessonCreationComponent implements OnInit {
  @Output() lessonCreated = new EventEmitter<Lesson>();

  lessonForm: FormGroup;

  // Exercise lists
  allExercises: any[] = [];
  freetextExercises: any[] = [];
  multiChoiceExercises: any[] = [];
  pairMatchExercises: any[] = [];

  // Filter variables
  searchTerm = '';
  typeFilter = 'all';
  jlptFilter = 'all';

  // Selected exercises
  selectedExercises: any[] = [];

  // Loading states
  loadingExercises = false;
  submitting = false;

  // Error message
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService,
    private authService: AuthService
  ) {
    this.lessonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      // lesson_type and jlpt_level will be determined by selected exercises
    });
  }

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loadingExercises = true;

    this.lessonService.getAllExercises().subscribe({
      next: (data) => {
        this.freetextExercises = data.freetext;
        this.multiChoiceExercises = data.multiChoice;
        this.pairMatchExercises = data.pairMatch;

        // Combine all exercises into one array with type information
        this.allExercises = [
          ...this.freetextExercises,
          ...this.multiChoiceExercises,
          ...this.pairMatchExercises
        ];

        this.loadingExercises = false;
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.errorMessage = 'Failed to load exercises. Please try again.';
        this.loadingExercises = false;
      }
    });
  }

  get filteredExercises(): any[] {
    return this.allExercises.filter(exercise => {
      let matchesSearch = true;
      let matchesType = true;
      let matchesJlpt = true;

      // Apply search filter (search in question, answer, or kanji/meaning)
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        if (exercise.type === 'freetext') {
          matchesSearch =
            (exercise.question?.toLowerCase().includes(term) || false) ||
            (exercise.answer?.toLowerCase().includes(term) || false);
        } else if (exercise.type === 'multi-choice') {
          matchesSearch =
            (exercise.question?.toLowerCase().includes(term) || false) ||
            (exercise.options?.some((opt: any) =>
              opt.answer?.toLowerCase().includes(term)) || false);
        } else if (exercise.type === 'pair-match') {
          matchesSearch =
            (exercise.kanji?.toLowerCase().includes(term) || false) ||
            (exercise.answer?.toLowerCase().includes(term) || false);
        }
      }

      // Apply type filter
      if (this.typeFilter !== 'all') {
        matchesType = exercise.type === this.typeFilter;
      }

      // Apply JLPT filter
      if (this.jlptFilter !== 'all') {
        matchesJlpt = exercise.jlpt_level?.toString() === this.jlptFilter;
      }

      return matchesSearch && matchesType && matchesJlpt;
    });
  }

  isExerciseSelected(exercise: any): boolean {
    return this.selectedExercises.some(e => e.id === exercise.id && e.type === exercise.type);
  }

  toggleExerciseSelection(exercise: any): void {
    if (this.isExerciseSelected(exercise)) {
      this.selectedExercises = this.selectedExercises.filter(
        e => !(e.id === exercise.id && e.type === exercise.type)
      );
    } else {
      this.selectedExercises.push(exercise);
    }
  }
  // Continue from Part 1...

  onSearchChange(): void {
    // Updated when search term changes
  }

  onTypeFilterChange(): void {
    // Updated when type filter changes
  }

  onJlptFilterChange(): void {
    // Updated when JLPT filter changes
  }

  getLessonType(): string {
    return this.lessonService.determineLessonType(this.selectedExercises);
  }

  getJlptLevelRange(): string {
    return this.lessonService.determineJlptLevelRange(this.selectedExercises);
  }

  // Helper method to get option letter (A, B, C, D)
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  createLesson(): void {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }

    if (this.selectedExercises.length === 0) {
      this.errorMessage = 'Please select at least one exercise for the lesson.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    // Create the lesson object
    const lesson: Lesson = {
      name: this.lessonForm.value.name,
      lesson_type: this.getLessonType(),
      jlpt_level: this.getJlptLevelRange(),
      exercise_count: this.selectedExercises.length
    };

    // Save the lesson and then add exercises to it
    this.lessonService.createLesson(lesson).subscribe({
      next: (createdLesson) => {
        // Now add the exercises to the lesson
        if (createdLesson.id) {
          this.lessonService.addExercisesToLesson(
            createdLesson.id,
            this.selectedExercises.map(e => ({ id: e.id, type: e.type }))
          ).subscribe({
            next: () => {
              this.submitting = false;
              this.lessonCreated.emit(createdLesson);

              // Reset the form
              this.lessonForm.reset();
              this.selectedExercises = [];
            },
            error: (err) => {
              console.error('Error adding exercises to lesson:', err);
              this.errorMessage = 'Failed to add exercises to lesson. Please try again.';
              this.submitting = false;
            }
          });
        }
      },
      error: (err) => {
        console.error('Error creating lesson:', err);
        this.errorMessage = 'Failed to create lesson. Please try again.';
        this.submitting = false;
      }
    });
  }

  cancelCreation(): void {
    // Reset the form
    this.lessonForm.reset();
    this.selectedExercises = [];
  }
}
