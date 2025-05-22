// Updated pair-match.component.ts - Clean version with requested changes

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { HttpClient } from '@angular/common/http';
import {MatChip, MatChipSet} from '@angular/material/chips';

interface MatchExercise {
  id?: number;
  jlpt_level: number;
  pairs: { kanji: string; answer: string }[];
  pair_count?: number;
}

interface PairLibraryItem {
  id: number;
  kanji: string;
  answer: string;
  jlpt_level: number;
  exercise_id: number;
  can_reuse: boolean;
}

@Component({
  selector: 'app-pair-match',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MATERIAL_IMPORTS,
    MatChipSet,
    MatChip
  ],
  templateUrl: './pair-match.component.html',
  styleUrls: ['./pair-match.component.css']
})
export class PairMatchComponent implements OnInit {
  matchExercises: MatchExercise[] = [];
  pairLibrary: PairLibraryItem[] = [];
  selectedPairs: PairLibraryItem[] = [];

  loadingExercises = false;
  loadingLibrary = false;

  // For creating individual pairs
  newKanji = '';
  newMeaning = '';
  pairJlptLevel = 5;

  // For creating exercises
  exerciseJlptLevel = 5;

  // Filters
  libraryJlptFilter = 'all';

  private exerciseUrl = 'http://127.0.0.1:8000/api/exercise-match/';
  private pairLibraryUrl = 'http://127.0.0.1:8000/api/pair-library/';
  private createFromPairsUrl = 'http://127.0.0.1:8000/api/create-exercise-from-pairs/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMatchExercises();
    this.loadPairLibrary();
  }

  // Load existing exercises (only those with 2+ pairs)
  loadMatchExercises(): void {
    this.loadingExercises = true;
    this.http.get<MatchExercise[]>(this.exerciseUrl).subscribe({
      next: (exercises) => {
        this.matchExercises = exercises;
        this.loadingExercises = false;
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.loadingExercises = false;
      }
    });
  }

  // Load pair library (only single pairs available for reuse)
  loadPairLibrary(): void {
    this.loadingLibrary = true;
    let url = this.pairLibraryUrl;
    if (this.libraryJlptFilter !== 'all') {
      url += `?jlpt_level=${this.libraryJlptFilter}`;
    }

    this.http.get<PairLibraryItem[]>(url).subscribe({
      next: (pairs) => {
        this.pairLibrary = pairs;
        this.loadingLibrary = false;
      },
      error: (err) => {
        console.error('Error loading pair library:', err);
        this.loadingLibrary = false;
      }
    });
  }

  // Create individual pair for library
  createPair(): void {
    if (!this.newKanji.trim() || !this.newMeaning.trim()) {
      alert('Please enter both kanji and meaning');
      return;
    }

    const pairData = {
      kanji: this.newKanji.trim(),
      answer: this.newMeaning.trim(),
      jlpt_level: this.pairJlptLevel
    };

    this.http.post<PairLibraryItem>(this.pairLibraryUrl, pairData).subscribe({
      next: () => {
        this.newKanji = '';
        this.newMeaning = '';
        this.loadPairLibrary(); // Reload library
        alert('Pair added to library!');
      },
      error: (err) => {
        console.error('Error creating pair:', err);
        const errorMsg = err.error?.detail || 'Failed to create pair';
        alert('Error: ' + errorMsg);
      }
    });
  }

  // Toggle pair selection
  togglePairSelection(pair: PairLibraryItem): void {
    const index = this.selectedPairs.findIndex(p => p.id === pair.id);
    if (index > -1) {
      this.selectedPairs.splice(index, 1);
    } else {
      this.selectedPairs.push(pair);
    }
  }

  isPairSelected(pair: PairLibraryItem): boolean {
    return this.selectedPairs.some(p => p.id === pair.id);
  }

  // Create exercise from selected pairs
  createExerciseFromPairs(): void {
    if (this.selectedPairs.length < 2) {
      alert('Please select at least 2 pairs');
      return;
    }

    const exerciseData = {
      pair_ids: this.selectedPairs.map(p => p.id),
      jlpt_level: this.exerciseJlptLevel
    };

    this.http.post<MatchExercise>(this.createFromPairsUrl, exerciseData).subscribe({
      next: (newExercise) => {
        this.selectedPairs = []; // Clear selection
        this.loadMatchExercises(); // Reload exercises
        // Note: We don't reload library because pairs should still be available for reuse
        alert(`Exercise created successfully with ${newExercise.pair_count} pairs!`);
      },
      error: (err) => {
        console.error('Error creating exercise:', err);
        const errorMsg = err.error?.detail || 'Failed to create exercise';
        alert('Error: ' + errorMsg);
      }
    });
  }

  // Clear selections
  clearSelection(): void {
    this.selectedPairs = [];
  }

  // Delete exercise
  deleteMatchExercise(id: number): void {
    if (confirm('Are you sure you want to delete this exercise?')) {
      this.http.delete(`${this.exerciseUrl}${id}/`).subscribe({
        next: () => {
          this.loadMatchExercises();
          alert('Exercise deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting exercise:', err);
          alert('Error deleting exercise');
        }
      });
    }
  }

  // Delete individual pair from library
  deletePairFromLibrary(pair: PairLibraryItem): void {
    if (confirm(`Are you sure you want to delete the pair "${pair.kanji} → ${pair.answer}"?`)) {
      // Delete the single-pair exercise that holds this library pair
      this.http.delete(`${this.exerciseUrl}${pair.exercise_id}/`).subscribe({
        next: () => {
          this.loadPairLibrary();
          // Remove from selection if it was selected
          this.selectedPairs = this.selectedPairs.filter(p => p.id !== pair.id);
          alert('Pair deleted from library');
        },
        error: (err) => {
          console.error('Error deleting pair:', err);
          alert('Error deleting pair');
        }
      });
    }
  }

  // Filter library
  onLibraryFilterChange(): void {
    this.loadPairLibrary();
  }

  get filteredPairLibrary(): PairLibraryItem[] {
    return this.pairLibrary;
  }

  // Helper method to get unique JLPT levels from selected pairs
  getSelectedPairsJlptLevels(): number[] {
    const levels = this.selectedPairs.map(p => p.jlpt_level);
    return [...new Set(levels)].sort();
  }

  // Helper method to suggest exercise JLPT level based on selected pairs
  getSuggestedExerciseJlptLevel(): number {
    if (this.selectedPairs.length === 0) return 5;

    const levels = this.getSelectedPairsJlptLevels();
    // Return the most common level, or the median if tied
    return levels[Math.floor(levels.length / 2)];
  }
}
