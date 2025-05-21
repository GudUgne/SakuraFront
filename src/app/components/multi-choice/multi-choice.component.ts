import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../material.shared';

@Component({
  selector: 'app-multi-choice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MATERIAL_IMPORTS
  ],
  templateUrl: './multi-choice.component.html',
  styleUrls: ['./multi-choice.component.css']
})
export class MultiChoiceComponent implements OnInit {
  multiChoiceForm: FormGroup;
  submittingQuestion = false;
  questionSuccess = false;
  questionError = false;
  errorMessage = '';
  multiChoiceQuestions: any[] = [];
  loadingQuestions = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.multiChoiceForm = this.fb.group({
      question: ['', Validators.required],
      jlpt_level: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      options: this.fb.array([])
    });

    // Add default 4 options
    for (let i = 0; i < 4; i++) {
      this.addOption();
    }
  }

  ngOnInit(): void {
    this.loadMultiChoiceQuestions();
  }

  get options(): FormArray {
    return this.multiChoiceForm.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(this.fb.group({
      answer: ['', Validators.required],
      is_correct: [false]
    }));
  }

  removeOption(index: number): void {
    if (this.options.length > 2) { // Keep at least 2 options
      this.options.removeAt(index);
    }
  }

  submitQuestion(): void {
    if (this.multiChoiceForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.multiChoiceForm);
      return;
    }

    // Check that at least one option is marked as correct
    const anyCorrect = this.options.controls.some(control => control.get('is_correct')?.value === true);
    if (!anyCorrect) {
      this.errorMessage = 'At least one option must be marked as correct';
      this.questionError = true;
      return;
    }

    this.submittingQuestion = true;
    this.questionError = false;

    const formValue = this.multiChoiceForm.value;

    // Format data for API
    const questionData = {
      question: formValue.question,
      jlpt_level: formValue.jlpt_level,
      options: formValue.options
    };

    // Send to backend API
    this.http.post('http://127.0.0.1:8000/api/exercise-multichoice/', questionData)
      .subscribe({
        next: (response) => {
          this.questionSuccess = true;
          this.submittingQuestion = false;
          this.resetQuestionForm();
          this.loadMultiChoiceQuestions(); // Reload the questions list
        },
        error: (err) => {
          this.questionError = true;
          this.errorMessage = err.error?.detail || 'Failed to create question';
          this.submittingQuestion = false;
        }
      });
  }

  resetQuestionForm(): void {
    this.multiChoiceForm.reset({
      question: '',
      jlpt_level: 5
    });

    // Reset options
    this.options.clear();
    for (let i = 0; i < 4; i++) {
      this.addOption();
    }
  }

  loadMultiChoiceQuestions(): void {
    this.loadingQuestions = true;
    this.http.get<any[]>('http://127.0.0.1:8000/api/exercise-multichoice/').subscribe({
      next: (data) => {
        this.multiChoiceQuestions = data;
        this.loadingQuestions = false;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        this.loadingQuestions = false;
      }
    });
  }

  deleteMultiChoiceQuestion(id: number): void {
    if (confirm('Are you sure you want to delete this question?')) {
      this.http.delete(`http://127.0.0.1:8000/api/exercise-multichoice/${id}/`).subscribe({
        next: () => {
          this.loadMultiChoiceQuestions();
        },
        error: (err) => {
          console.error('Error deleting question:', err);
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        (control as FormArray).controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }
}
