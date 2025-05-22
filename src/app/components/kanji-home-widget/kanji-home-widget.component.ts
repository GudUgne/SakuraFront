import { Component, OnInit } from '@angular/core';
import { KanjiService } from '../../services/kanji.service';
import {MATERIAL_IMPORTS} from '../../material.shared';

@Component({
  selector: 'app-kanji-home-widget',
  templateUrl: './kanji-home-widget.component.html',
  imports: [
    MATERIAL_IMPORTS
  ],
  styleUrls: ['./kanji-home-widget.component.scss']
})
export class KanjiHomeWidgetComponent implements OnInit {
  kanji: string = '';
  meanings: string[] = [];
  kunReadings: string[] = [];
  onReadings: string[] = [];
  jlptLevel?: number;

  constructor(private kanjiService: KanjiService) {}

  ngOnInit(): void {
    this.loadKanjiOfTheDay();
  }

  loadKanjiOfTheDay(): void {
    const today = new Date().toISOString().split('T')[0]; // e.g. "2025-04-25"
    const savedDate = localStorage.getItem('kanjiOfTheDayDate');
    const savedKanji = localStorage.getItem('kanjiOfTheDayData');

    if (savedDate === today && savedKanji) {
      const data = JSON.parse(savedKanji);
      this.applyKanjiData(data);
    } else {

      this.kanjiService.getRandomKanji().subscribe(data => {
        this.applyKanjiData(data);
        localStorage.setItem('kanjiOfTheDayDate', today);
        localStorage.setItem('kanjiOfTheDayData', JSON.stringify(data));
      });
    }
  }

  applyKanjiData(data: any): void {
    this.kanji = data.kanji;
    this.meanings = data.meanings;
    this.kunReadings = data.kun_readings;
    this.onReadings = data.on_readings;
    this.jlptLevel = data.jlpt;
  }
}
