import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseMatchService, ExerciseMatch, ExerciseMatchOption } from '../../services/exercise-match.service';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MATERIAL_IMPORTS
  ]
})
export class ExerciseComponent implements OnInit {
  // Matching exercise variables
  matchingExercises: ExerciseMatch[] = [];
  loadingMatches = false;

  // For matching input fields
  newKanji = '';
  newMeaning = '';
  jlptLevel = 5;

  // To track existing pairs for duplicate prevention
  existingPairs: Set<string> = new Set();

  // Multiple choice variables
  multiChoiceForm: FormGroup;
  submittingQuestion = false;
  questionSuccess = false;
  questionError = false;
  errorMessage = '';
  multiChoiceQuestions: any[] = [];
  loadingQuestions = false;

  constructor(
    private matchService: ExerciseMatchService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Initialize multiple choice form
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
    this.loadMatchingExercises();
    this.loadMatchOptions();
    this.loadMultiChoiceQuestions();
  }

  // MATCHING EXERCISES METHODS

  loadMatchingExercises(): void {
    this.loadingMatches = true;
    this.matchService.getMatches().subscribe({
      next: (matches) => {
        this.matchingExercises = matches;
        this.loadingMatches = false;
      },
      error: (err) => {
        console.error('Error loading matching exercises:', err);
        this.loadingMatches = false;
      }
    });
  }

  loadMatchOptions(): void {
    this.matchService.getAllMatchOptions().subscribe({
      next: (options) => {
        // Store both directions of each pair to prevent duplicates
        options.forEach(option => {
          const normalizedAnswer = option.answer.toLowerCase();
          const normalizedKanji = option.kanji.toLowerCase();
          this.existingPairs.add(`${normalizedKanji}|${normalizedAnswer}`);
          this.existingPairs.add(`${normalizedAnswer}|${normalizedKanji}`);
        });
      },
      error: (err) => {
        console.error('Error loading match options:', err);
      }
    });
  }

  // Check if a potential match would be a duplicate
  isDuplicate(kanji: string, answer: string): boolean {
    const normalizedAnswer = answer.toLowerCase();
    const normalizedKanji = kanji.toLowerCase();
    return this.existingPairs.has(`${normalizedKanji}|${normalizedAnswer}`) ||
      this.existingPairs.has(`${normalizedAnswer}|${normalizedKanji}`);
  }

  saveMatchToDb(): void {
    if (!this.newKanji || !this.newMeaning) {
      alert('Please enter both kanji and meaning');
      return;
    }

    // Check if this pair or its reverse already exists
    if (this.isDuplicate(this.newKanji, this.newMeaning)) {
      alert(`A matching pair with kanji "${this.newKanji}" and meaning "${this.newMeaning}" already exists`);
      return;
    }

    // Create the parent match
    const newMatch: ExerciseMatch = {
      jlpt_level: this.jlptLevel
    };

    this.matchService.addMatch(newMatch).subscribe({
      next: (createdMatch) => {
        // Now create the option
        const newOption: ExerciseMatchOption = {
          exercise_match: createdMatch.id!,
          kanji: this.newKanji,
          answer: this.newMeaning
        };

        this.matchService.addMatchOption(newOption).subscribe({
          next: () => {
            // Add both directions to prevent future duplicates
            const normalizedAnswer = this.newMeaning.toLowerCase();
            const normalizedKanji = this.newKanji.toLowerCase();
            this.existingPairs.add(`${normalizedKanji}|${normalizedAnswer}`);
            this.existingPairs.add(`${normalizedAnswer}|${normalizedKanji}`);

            // Reset form
            this.newKanji = '';
            this.newMeaning = '';

            // Refresh list
            this.loadMatchingExercises();

            alert('Match saved successfully');
          },
          error: (err) => {
            console.error('Error saving match option:', err);
            alert('Error saving match option');
          }
        });
      },
      error: (err) => {
        console.error('Error saving match:', err);
        alert('Error saving match');
      }
    });
  }

  deleteMatchingExercise(id: number): void {
    if (confirm('Are you sure you want to delete this matching exercise?')) {
      this.matchService.deleteMatch(id).subscribe({
        next: () => {
          this.loadMatchingExercises();
        },
        error: (err) => {
          console.error('Error deleting matching exercise:', err);
        }
      });
    }
  }

  // MULTIPLE CHOICE METHODS

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
