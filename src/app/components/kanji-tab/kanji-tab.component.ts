import {Component, OnInit} from '@angular/core';
import {KanjiService} from '../../services/kanji.service';
import {forkJoin, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {MATERIAL_IMPORTS} from '../../material.shared';

@Component({
  selector: 'app-kanji-tab',
  templateUrl: './kanji-tab.component.html',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    MATERIAL_IMPORTS
  ],
  styleUrl: './kanji-tab.component.css'
})


export class KanjiTabComponent implements OnInit {
  selectedLevel = 5;
  selectedStroke = 'any';

  levels = [5, 4, 3, 2, 1];
  strokeOptions = ['any', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];

  kanjiList: string[] = [];
  loading = false;

  sortOptions = ['none', 'most frequent', 'least frequent'];
  selectedSort = 'none';

  constructor(private kanjiService: KanjiService) {}

  ngOnInit(): void {
    this.fetchKanji();
  }

  resetFilters(): void {
    this.selectedLevel = 5;
    this.selectedStroke = 'any';
    this.fetchKanji();
  }

  onLevelChange(level: number): void {
    this.selectedLevel = level;
    this.fetchKanji();
  }

  onStrokeChange(stroke: string): void {
    this.selectedStroke = stroke;
    this.fetchKanji();
  }

  fetchKanji(): void {
    this.loading = true;

    this.kanjiService.getKanjiByJLPT(this.selectedLevel).pipe(
      switchMap(kanjiList => {
        // Always fetch details first
        return forkJoin(kanjiList.map(k => this.kanjiService.getKanjiDetails(k)));
      }),
      map(details => {
        // 1. Filter by stroke count if needed
        if (this.selectedStroke !== 'any') {
          const strokeNumber = this.selectedStroke === '10+' ? 10 : parseInt(this.selectedStroke, 10);
          details = details.filter(k =>
            this.selectedStroke === '10+'
              ? k.stroke_count >= 10
              : k.stroke_count === strokeNumber
          );
        }

        // 2. Sort by frequency if needed
        if (this.selectedSort === 'most frequent') {
          details.sort((a, b) =>
            (a.freq_mainichi_shinbun ?? Infinity) - (b.freq_mainichi_shinbun ?? Infinity)
          );
        } else if (this.selectedSort === 'least frequent') {
          details.sort((a, b) =>
            (b.freq_mainichi_shinbun ?? -1) - (a.freq_mainichi_shinbun ?? -1)
          );
        }

        // 3. Return kanji characters only
        return details.map(k => k.kanji);
      })
    ).subscribe({
      next: data => {
        this.kanjiList = data;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to fetch kanji:', err);
        this.loading = false;
      }
    });
  }


  selectedKanji: string | null = null;
  kanjiDetails: any = null;

  selectKanji(kanji: string): void {
    this.selectedKanji = kanji;

    this.kanjiService.getKanjiDetails(kanji).subscribe({
      next: (details) => {
        this.kanjiDetails = details;
      },
      error: (err) => {
        console.error('Failed to fetch kanji details:', err);
      }
    });
  }

  closePanel(drawer: any): void {
    drawer.close();
    this.kanjiDetails = null;
  }

  closeIfClickedOutside(drawer: any): void {
    if (this.kanjiDetails) {
      this.closePanel(drawer);
    }
  }

}
