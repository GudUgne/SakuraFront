import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { FreetextExerciseService } from '../../services/freetext-exercise.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-freetext-create',
  templateUrl: './freetext-create.component.html',
  styleUrls: ['./freetext-create.component.css'],
  standalone: true,
  imports: [MATERIAL_IMPORTS, ReactiveFormsModule, NgIf]
})
export class FreetextCreateComponent implements OnInit {
  exerciseForm: FormGroup;
  isTeacher = false;
  jlptLevels = [1, 2, 3, 4, 5];
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private freetextService: FreetextExerciseService,
    private authService: AuthService,
    private router: Router
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
          this.router.navigate(['/app/exercise']);
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      this.exerciseForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.freetextService.createExercise(this.exerciseForm.value).subscribe({
      next: () => {
        this.loading = false;
        // Success message
        console.log('Exercise created successfully!');
        // Reset form or navigate
        this.router.navigate(['/app/exercise/review']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.detail || 'Failed to create exercise. Please try again.';
        console.error('Error creating exercise:', err);
      }
    });
  }

  // Convenience getters for form fields
  get questionControl() { return this.exerciseForm.get('question'); }
  get answerControl() { return this.exerciseForm.get('answer'); }
  get jlptLevelControl() { return this.exerciseForm.get('jlpt_level'); }
}
