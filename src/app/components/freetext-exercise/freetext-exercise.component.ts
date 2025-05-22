import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { FreetextExerciseService, FreetextExercise } from '../../services/freetext-exercise.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-freetext-exercise',
  templateUrl: './freetext-exercise.component.html',
  styleUrls: ['./freetext-exercise.component.css'],
  standalone: true,
  imports: [MATERIAL_IMPORTS, FormsModule, NgIf, NgForOf]
})
export class FreetextExerciseComponent implements OnInit {
  exercises: FreetextExercise[] = [];
  isTeacher = false;
  loading = true;

  constructor(
    private freetextService: FreetextExerciseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        this.loadExercises();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.isTeacher = false;
        this.loadExercises();
      }
    });
  }

  loadExercises(): void {
    this.loading = true;
    this.freetextService.getExercises().subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.loading = false;
      }
    });
  }

  createNewExercise(): void {
    this.router.navigate(['/app/exercise/create']);
  }

  editExercise(exercise: FreetextExercise): void {
    if (!exercise.id) return;
    this.router.navigate(['/app/exercise/edit', exercise.id]);
  }

  deleteExercise(exercise: FreetextExercise): void {
    if (!exercise.id) return;

    if (confirm('Are you sure you want to delete this exercise?')) {
      this.freetextService.deleteExercise(exercise.id).subscribe({
        next: () => {
          this.exercises = this.exercises.filter(ex => ex.id !== exercise.id);
        },
        error: (err) => {
          console.error('Error deleting exercise:', err);
        }
      });
    }
  }
}
