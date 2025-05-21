import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgForOf } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { FreetextExerciseService } from '../../services/freetext-exercise.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface PendingSubmission {
  id: number;
  exercise: any;
  student: any;
  student_answer: string;
  submission_date: string;
  is_reviewed: boolean;
  is_correct: boolean;
  teacher_feedback: string | null;
}

@Component({
  selector: 'app-freetext-review',
  templateUrl: './freetext-review.component.html',
  styleUrls: ['./freetext-review.component.css'],
  standalone: true,
  imports: [MATERIAL_IMPORTS, ReactiveFormsModule, NgIf, NgForOf]
})
export class FreetextReviewComponent implements OnInit {
  pendingSubmissions: PendingSubmission[] = [];
  isTeacher = false;
  loading = true;
  currentSubmission: PendingSubmission | null = null;
  reviewForm: FormGroup;
  feedbackMessage = '';

  constructor(
    private fb: FormBuilder,
    private freetextService: FreetextExerciseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.reviewForm = this.fb.group({
      is_correct: [false, Validators.required],
      teacher_feedback: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;
        if (!this.isTeacher) {
          // Redirect non-teachers away
          this.router.navigate(['/app/exercise']);
          return;
        }

        this.loadPendingSubmissions();
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.loading = false;
      }
    });
  }

  loadPendingSubmissions(): void {
    this.loading = true;
    this.freetextService.getPendingSubmissions().subscribe({
      next: (submissions) => {
        this.pendingSubmissions = submissions;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading submissions:', err);
        this.loading = false;
      }
    });
  }

  selectSubmission(submission: PendingSubmission): void {
    this.currentSubmission = submission;
    this.reviewForm.reset({
      is_correct: false,
      teacher_feedback: ''
    });
    this.feedbackMessage = '';
  }

  submitReview(): void {
    if (!this.currentSubmission || this.reviewForm.invalid) {
      return;
    }

    const reviewData = {
      is_correct: this.reviewForm.value.is_correct,
      teacher_feedback: this.reviewForm.value.teacher_feedback,
      is_reviewed: true
    };

    this.freetextService.reviewSubmission(this.currentSubmission.id, reviewData).subscribe({
      next: () => {
        this.feedbackMessage = 'Review submitted successfully!';
        // Remove the reviewed submission from the list
        this.pendingSubmissions = this.pendingSubmissions.filter(
          sub => sub.id !== this.currentSubmission?.id
        );
        this.currentSubmission = null;

        setTimeout(() => {
          this.feedbackMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.feedbackMessage = 'Failed to submit review. Please try again.';
      }
    });
  }
}
