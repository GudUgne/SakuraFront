import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgIf, NgForOf, NgClass} from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { FreetextExerciseService, FreetextExercise } from '../../services/freetext-exercise.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-freetext-exercise',
  templateUrl: './freetext-exercise.component.html',
  styleUrls: ['./freetext-exercise.component.css'],
  standalone: true,
  imports: [MATERIAL_IMPORTS, FormsModule, NgIf, NgClass]
})
export class FreetextExerciseComponent implements OnInit {
  exercises: FreetextExercise[] = [];
  currentExercise: FreetextExercise | null = null;
  exerciseIndex = 0;
  userAnswer = '';
  showAnswer = false;
  isCorrect = false;
  isTeacher = false;
  loading = true;
  feedback = '';

  constructor(
    private freetextService: FreetextExerciseService,
    private authService: AuthService,
    private router: Router
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

  checkAnswer(): void {
    if (!this.currentExercise) return;

    // Simple exact match (case insensitive)
    this.isCorrect = this.userAnswer.trim().toLowerCase() ===
      this.currentExercise.answer.trim().toLowerCase();

    this.showAnswer = true;
    this.feedback = this.isCorrect ? 'Correct! Well done.' : 'Not quite right. Check the correct answer below.';
  }

  nextExercise(): void {
    if (this.exercises.length <= 1) return;

    this.exerciseIndex = (this.exerciseIndex + 1) % this.exercises.length;
    this.currentExercise = this.exercises[this.exerciseIndex];
    this.resetExercise();
  }

  previousExercise(): void {
    if (this.exercises.length <= 1) return;

    this.exerciseIndex = (this.exerciseIndex - 1 + this.exercises.length) % this.exercises.length;
    this.currentExercise = this.exercises[this.exerciseIndex];
    this.resetExercise();
  }

  resetExercise(): void {
    this.userAnswer = '';
    this.showAnswer = false;
    this.isCorrect = false;
    this.feedback = '';
  }

  createNewExercise(): void {
    this.router.navigate(['/app/exercise/create']);
  }

  editExercise(exercise: FreetextExercise): void {
    this.router.navigate(['/app/exercise/edit', exercise.id]);
  }

  deleteExercise(exercise: FreetextExercise): void {
    if (!exercise.id) return;

    if (confirm('Are you sure you want to delete this exercise?')) {
      this.freetextService.deleteExercise(exercise.id).subscribe({
        next: () => {
          this.exercises = this.exercises.filter(ex => ex.id !== exercise.id);
          if (this.currentExercise?.id === exercise.id) {
            this.resetExercise();
            if (this.exercises.length > 0) {
              this.exerciseIndex = 0;
              this.currentExercise = this.exercises[0];
            } else {
              this.currentExercise = null;
            }
          }
        },
        error: (err) => {
          console.error('Error deleting exercise:', err);
        }
      });
    }
  }
}
