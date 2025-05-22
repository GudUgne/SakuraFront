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
  in_exercise?: number;
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

  // Load existing exercises
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

  // Load pair library
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
    if (!this.newKanji || !this.newMeaning) {
      alert('Please enter both kanji and meaning');
      return;
    }

    const pairData = {
      kanji: this.newKanji,
      answer: this.newMeaning,
      jlpt_level: this.pairJlptLevel
    };

    this.http.post<PairLibraryItem>(this.pairLibraryUrl, pairData).subscribe({
      next: () => {
        this.newKanji = '';
        this.newMeaning = '';
        this.loadPairLibrary();
        alert('Pair added to library!');
      },
      error: (err) => {
        console.error('Error creating pair:', err);
        alert('Error: ' + (err.error?.detail || 'Failed to create pair'));
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
      next: () => {
        this.selectedPairs = [];
        this.loadMatchExercises();
        alert('Exercise created successfully!');
      },
      error: (err) => {
        console.error('Error creating exercise:', err);
        alert('Error: ' + (err.error?.detail || 'Failed to create exercise'));
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
        },
        error: (err) => {
          console.error('Error deleting exercise:', err);
          alert('Error deleting exercise');
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
}
