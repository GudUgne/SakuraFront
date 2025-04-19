import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { KanjiService, KanjiData } from '../../services/kanji.service';
import { ExerciseMatchService, ExerciseMatch } from '../../services/exercise-match.service';
import { MATERIAL_IMPORTS } from '../../material.shared';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-match-kanji-generator',
  templateUrl: './match-kanji-generator.component.html',
  styleUrl: './match-kanji-generator.component.css',
  standalone: true,
  imports: [
    MATERIAL_IMPORTS,
    NgIf,
    NgForOf,
    FormsModule
  ]
})
export class MatchKanjiGeneratorComponent implements OnInit {
  kanjiPool: string[] = []; // 💡 replaces sampleKanji
  kanjiInfo: KanjiData | null = null;
  jlptLevel = 5;

  @Output() matchesUpdated = new EventEmitter<void>();

  existingMatches: Set<string> = new Set();

  constructor(
    private kanjiService: KanjiService,
    private matchService: ExerciseMatchService
  ) {}

  ngOnInit(): void {
    this.loadKanjiPool();
    this.matchService.getMatches().subscribe(matches => {
      matches.forEach(match => {
        this.existingMatches.add(`${match.kanji}|${match.answer.toLowerCase()}`);
      });
    });
  }

  // 🔁 Called on init and whenever JLPT level changes (from input)
  loadKanjiPool(): void {
    this.kanjiService.getKanjiByJLPT(this.jlptLevel).subscribe({
      next: (kanjiList) => {
        this.kanjiPool = kanjiList;
      },
      error: () => alert('Failed to load kanji list.')
    });
  }

  generateKanji(): void {
    if (this.kanjiPool.length === 0) {
      alert('No kanji loaded yet.');
      return;
    }

    const selected = this.kanjiPool[Math.floor(Math.random() * this.kanjiPool.length)];

    this.kanjiService.getKanjiDetails(selected).subscribe({
      next: (data) => {
        this.kanjiInfo = data;
        this.kanjiInfo.jlpt = this.jlptLevel; // always override with selected level
      },
      error: () => alert('Failed to fetch kanji data.')
    });
  }

  saveToDb(): void {
    if (!this.kanjiInfo) return;

    const level = this.jlptLevel;
    const kanji = this.kanjiInfo.kanji;
    const saveRequests: Observable<any>[] = [];

    this.kanjiInfo.meanings.forEach((meaning: string) => {
      const key = `${kanji}|${meaning.toLowerCase()}`;
      if (this.existingMatches.has(key)) {
        console.log(`Skipping duplicate: ${key}`);
        return;
      }

      const newEntry: ExerciseMatch = {
        kanji: kanji,
        answer: meaning,
        jlpt_level: level
      };

      const req = this.matchService.addMatch(newEntry).pipe(
        tap(() => this.existingMatches.add(key))
      );

      saveRequests.push(req);
    });

    if (saveRequests.length === 0) {
      alert('No new entries were saved. All were duplicates.');
      return;
    }

    forkJoin(saveRequests).subscribe({
      next: () => {
        alert(`Saved ${saveRequests.length} new entries.`);
        this.matchesUpdated.emit(); // refresh table
      },
      error: () => alert('Something went wrong while saving.')
    });
  }
}
