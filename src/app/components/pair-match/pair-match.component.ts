import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { ExerciseMatchService, ExerciseMatch, ExerciseMatchOption } from '../../services/exercise-match.service';

@Component({
  selector: 'app-pair-match',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MATERIAL_IMPORTS
  ],
  templateUrl: './pair-match.component.html',
  styleUrls: ['./pair-match.component.css']
})
export class PairMatchComponent implements OnInit {
  matchingExercises: ExerciseMatch[] = [];
  loadingMatches = false;

  // For matching input fields
  newKanji = '';
  newMeaning = '';
  jlptLevel = 5;

  // To track existing pairs for duplicate prevention
  existingPairs: Set<string> = new Set();

  constructor(private matchService: ExerciseMatchService) {}

  ngOnInit(): void {
    this.loadMatchingExercises();
    this.loadMatchOptions();
  }

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
}
