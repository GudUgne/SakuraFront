import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { FreetextExerciseService, FreetextExercise } from '../../services/freetext-exercise.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-freetext-edit',
  templateUrl: './freetext-edit.component.html',
  styleUrls: ['./freetext-edit.component.css'],
  standalone: true,
  imports: [MATERIAL_IMPORTS, ReactiveFormsModule, NgIf, RouterLink, NgForOf]
})
export class FreetextEditComponent implements OnInit {
  exerciseForm: FormGroup;
  isTeacher = false;
  isEditMode = false;
  exerciseId: number | null = null;
  loading = false;
  submitting = false;
  errorMessage = '';
  jlptLevels = [1, 2, 3, 4, 5]; // JLPT levels from N1 to N5

  constructor(
    private fb: FormBuilder,
    private freetextService: FreetextExerciseService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.exerciseForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(3)]],
      answer: ['', [Validators.required, Validators.minLength(1)]],
      jlpt_level: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        if (!this.isTeacher) {
          // Redirect non-teachers away
          this.router.navigate(['/app/home']);
          return;
        }

        // Check if we're in edit mode
        this.route.params.subscribe(params => {
          if (params['id']) {
            this.isEditMode = true;
            this.exerciseId = +params['id'];
            this.loadExercise();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.router.navigate(['/app/home']);
      }
    });
  }

  loadExercise(): void {
    if (!this.exerciseId) return;

    this.loading = true;
    this.freetextService.getExercise(this.exerciseId).subscribe({
      next: (exercise) => {
        this.exerciseForm.patchValue({
          question: exercise.question,
          answer: exercise.answer,
          jlpt_level: exercise.jlpt_level
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading exercise:', err);
        this.errorMessage = 'Failed to load exercise. Please try again.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      this.exerciseForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const exerciseData: FreetextExercise = {
      question: this.exerciseForm.value.question,
      answer: this.exerciseForm.value.answer,
      jlpt_level: this.exerciseForm.value.jlpt_level
    };

    // Determine if we're creating or updating
    const request = this.isEditMode && this.exerciseId
      ? this.freetextService.updateExercise(this.exerciseId, exerciseData)
      : this.freetextService.createExercise(exerciseData);

    request.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/app/exercise']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.detail || 'Failed to save exercise. Please try again.';
        console.error('Error saving exercise:', err);
      }
    });
  }

  // Convenience getters for form fields
  get questionControl() { return this.exerciseForm.get('question'); }
  get answerControl() { return this.exerciseForm.get('answer'); }
  get jlptLevelControl() { return this.exerciseForm.get('jlpt_level'); }

  cancel(): void {
    this.router.navigate(['/app/exercise']);
  }
}
