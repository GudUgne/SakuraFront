import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { AuthService } from '../../services/auth.service';
import { PairMatchComponent } from '../../components/pair-match/pair-match.component';
import { MultiChoiceComponent } from '../../components/multi-choice/multi-choice.component';
import { FreetextExerciseComponent } from '../../components/freetext-exercise/freetext-exercise.component';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [
    CommonModule,
    MATERIAL_IMPORTS,
    PairMatchComponent,
    MultiChoiceComponent,
    FreetextExerciseComponent
  ],
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css']
})
export class ExerciseComponent implements OnInit {
  isTeacher = false;
  loading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is a teacher
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        this.loading = false;

        if (!this.isTeacher) {
          // Redirect non-teachers away
          this.router.navigate(['/app/home']);
        }
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.loading = false;
        this.router.navigate(['/app/home']);
      }
    });
  }
}
