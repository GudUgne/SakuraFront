import { Component, Input, OnInit } from '@angular/core';
import {
  HIRAGANA_TABLE,
  HIRAGANA_COMPOUND_GROUPED,
  KATAKANA_TABLE,
  KATAKANA_COMPOUND_GROUPED
} from '../../kana-data';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-kana-grid',
  templateUrl: './kana-grid.component.html',
  imports: [
    NgForOf
  ],
  styleUrl: './kana-grid.component.css'
})
export class KanaGridComponent implements OnInit {
  @Input() kanaType!: 'hiragana' | 'katakana';

  tableData: any[] = [];
  compoundData: any[] = [];

  flipped: boolean[][] = [];
  compoundFlipped: boolean[][] = [];

  ngOnInit(): void {
    if (this.kanaType === 'hiragana') {
      this.tableData = this.transposeTable(HIRAGANA_TABLE);
      this.compoundData = this.transposeCompoundTable(HIRAGANA_COMPOUND_GROUPED);
    } else {
      this.tableData = this.transposeTable(KATAKANA_TABLE);
      this.compoundData = this.transposeCompoundTable(KATAKANA_COMPOUND_GROUPED);
    }

    this.flipped = this.tableData.map(row => row.kana.map(() => false));
    this.compoundFlipped = this.compoundData.map(row => row.kana.map(() => false));
  }

  toggleFlip(rowIndex: number, colIndex: number, compound: boolean = false): void {
    if (compound) {
      this.compoundFlipped[rowIndex][colIndex] = !this.compoundFlipped[rowIndex][colIndex];
    } else {
      this.flipped[rowIndex][colIndex] = !this.flipped[rowIndex][colIndex];
    }
  }

  transposeTable(table: any[]): any[] {
    const rows = table.map(r => r.kana);
    const romaji = table.map(r => r.romaji);
    const headers = table.map(r => r.row);

    const transposed = [];

    for (let col = 0; col < 5; col++) {
      transposed[col] = {
        vowel: ['A', 'I', 'U', 'E', 'O'][col],
        kana: rows.map(r => r[col]),
        romaji: romaji.map(r => r[col]),
        consonants: headers
      };
    }

    return transposed;
  }
  transposeCompoundTable(compound: any[]): any[] {
    const transposed = [];

    for (let col = 0; col < 3; col++) {
      const rowKana = compound.map(r => r.kana[col]);
      const rowRomaji = compound.map(r => r.romaji[col]);
      const consonants = compound.map(r => r.romajiGroup);

      transposed.push({
        vowel: ['YA', 'YU', 'YO'][col], // Or keep it "", "middle", etc.
        kana: rowKana,
        romaji: rowRomaji,
        consonants
      });
    }

    return transposed;
  }
}
