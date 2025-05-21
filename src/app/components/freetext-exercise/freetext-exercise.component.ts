import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { FreetextExerciseService } from '../../services/freetext-exercise.service';
import { AuthService } from '../../services/auth.service';

interface FreetextExercise {
  id: number;
  question: string;
  jlpt_level: number;
}

interface FreetextSubmission {
  id?: number;
  exercise: number;
  student_answer: string;
  is_reviewed?: boolean;
  is_correct?: boolean;
  teacher_feedback?: string;
}

@Component({
  selector: 'app-freetext-exercise',
  templateUrl: './freetext-exercise.component.html',
  styleUrls: ['./freetext-exercise.component.css'],
  standalone: true,
  imports: [MATERIAL_IMPORTS, FormsModule, NgIf, NgForOf]
})
export class FreetextExerciseComponent implements OnInit {
  exercises: FreetextExercise[] = [];
  currentExercise: FreetextExercise | null = null;
  exerciseIndex = 0;
  userAnswer = '';
  submitted = false;
  submissionResult: any = null;
  isTeacher = false;
  loading = true;

  constructor(
    private freetextService: FreetextExerciseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.isTeacher = user.is_teacher;
      this.loadExercises();
    });
  }

  loadExercises(): void {
    this.loading = true;
    this.freetextService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        if (exercises.length > 0) {
          this.currentExercise = exercises[0];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.loading = false;
      }
    });
  }

  submitAnswer(): void {
    if (!this.currentExercise) return;

    const submission: FreetextSubmission = {
      exercise: this.currentExercise.id,
      student_answer: this.userAnswer
    };

    this.freetextService.submitAnswer(submission).subscribe({
      next: (result) => {
        this.submitted = true;
        this.submissionResult = result;

        // If auto-checked as correct, show feedback immediately
        if (result.is_reviewed && result.is_correct) {
          this.showSuccess('Correct answer! Well done.');
        } else if (result.is_reviewed && !result.is_correct) {
          this.showError('Incorrect answer. Try again or check the solution.');
        } else {
          this.showInfo('Your answer has been submitted and will be reviewed by a teacher.');
        }
      },
      error: (err) => {
        console.error('Error submitting answer:', err);
        this.showError('Failed to submit your answer. Please try again.');
      }
    });
  }

  nextExercise(): void {
    this.exerciseIndex = (this.exerciseIndex + 1) % this.exercises.length;
    this.currentExercise = this.exercises[this.exerciseIndex];
    this.resetExercise();
  }

  previousExercise(): void {
    this.exerciseIndex = (this.exerciseIndex - 1 + this.exercises.length) % this.exercises.length;
    this.currentExercise = this.exercises[this.exerciseIndex];
    this.resetExercise();
  }

  resetExercise(): void {
    this.userAnswer = '';
    this.submitted = false;
    this.submissionResult = null;
  }

  showSuccess(message: string): void {
    // You can replace this with your preferred notification method
    console.log('Success:', message);
  }

  showError(message: string): void {
    console.error('Error:', message);
  }

  showInfo(message: string): void {
    console.info('Info:', message);
  }
}
