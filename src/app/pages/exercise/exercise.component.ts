import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { ExerciseMatchService, ExerciseMatch } from '../../services/exercise-match.service';

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MATERIAL_IMPORTS
  ],
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css'
})
export class ExerciseComponent implements OnInit {
  // User info
  isTeacher = false;

  // Common
  jlptLevels = [1, 2, 3, 4, 5];
  selectedJlptLevel = 5;

  // Matching pairs
  matchPairs: { kanji: string, answer: string }[] = [];
  newPair = { kanji: '', answer: '' };
  existingMatches: Set<string> = new Set();

  // Multiple choice
  multiChoiceQuestion = '';
  multiChoiceOptions: { text: string, isCorrect: boolean }[] = [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private exerciseMatchService: ExerciseMatchService
  ) {}

  ngOnInit(): void {
    // Check if user is a teacher
    this.authService.getCurrentUser().subscribe(user => {
      this.isTeacher = user.is_teacher;

      // If not a teacher, we could redirect or show a message
      if (!this.isTeacher) {
        console.warn('Only teachers can create exercises');
      } else {
        // Load existing matches for duplication checking
        this.loadExistingMatches();
      }
    });
  }

  loadExistingMatches(): void {
    this.exerciseMatchService.getMatches().subscribe({
      next: (matches) => {
        this.existingMatches.clear();
        matches.forEach(match => {
          this.existingMatches.add(`${match.kanji}|${match.answer.toLowerCase()}`);
        });
      },
      error: (err) => console.error('Failed to load existing matches', err)
    });
  }

  addMatchPair(): void {
    if (!this.newPair.kanji.trim() || !this.newPair.answer.trim()) {
      alert('Both fields are required');
      return;
    }

    // Check for duplicates in current list
    const isDuplicateInCurrent = this.matchPairs.some(
      pair => pair.kanji === this.newPair.kanji &&
        pair.answer.toLowerCase() === this.newPair.answer.toLowerCase()
    );

    if (isDuplicateInCurrent) {
      alert('This pair already exists in your current list');
      return;
    }

    // Check for duplicates in database
    const key = `${this.newPair.kanji}|${this.newPair.answer.toLowerCase()}`;
    if (this.existingMatches.has(key)) {
      alert('This pair already exists in the database');
      return;
    }

    // Add to current list
    this.matchPairs.push({
      kanji: this.newPair.kanji,
      answer: this.newPair.answer
    });

    // Clear input fields
    this.newPair = { kanji: '', answer: '' };
  }

  removeMatchPair(index: number): void {
    this.matchPairs.splice(index, 1);
  }

  saveMatchPairs(): void {
    if (this.matchPairs.length === 0) {
      alert('Add at least one pair before saving');
      return;
    }

    // Create an array of observables for each pair to save
    const saveRequests: Observable<any>[] = [];

    // Prepare save requests for each pair
    this.matchPairs.forEach(pair => {
      const matchData: ExerciseMatch = {
        jlpt_level: this.selectedJlptLevel,
        kanji: pair.kanji,
        answer: pair.answer
      };

      saveRequests.push(
        this.exerciseMatchService.addMatch(matchData)
      );
    });

    // Execute all save requests in parallel
    forkJoin(saveRequests).subscribe({
      next: (responses) => {
        alert(`Successfully saved ${responses.length} matching pairs!`);
        this.matchPairs = []; // Clear the list
        this.loadExistingMatches(); // Refresh the existing matches list
      },
      error: (err) => {
        console.error('Error saving match pairs', err);
        alert('Failed to save some or all match pairs. Please try again.');
      }
    });
  }

  // Multiple choice methods
  addOption(): void {
    if (this.multiChoiceOptions.length < 6) {
      this.multiChoiceOptions.push({ text: '', isCorrect: false });
    }
  }

  removeOption(index: number): void {
    if (this.multiChoiceOptions.length > 2) {
      this.multiChoiceOptions.splice(index, 1);
    }
  }

  setCorrectOption(index: number): void {
    // Unselect all options
    this.multiChoiceOptions.forEach((option, i) => {
      option.isCorrect = (i === index);
    });
  }

  saveMultiChoice(): void {
    // Validation
    if (!this.multiChoiceQuestion.trim()) {
      alert('Please enter a question');
      return;
    }

    // Check if at least one option is marked as correct
    if (!this.multiChoiceOptions.some(option => option.isCorrect)) {
      alert('Please mark at least one option as correct');
      return;
    }

    // Check if all options have text
    if (this.multiChoiceOptions.some(option => !option.text.trim())) {
      alert('All options must have text');
      return;
    }

    // Here we would save to the backend
    // This would require creating a proper service and API endpoint
    alert('Multiple choice exercise saving not yet implemented');
  }
}
