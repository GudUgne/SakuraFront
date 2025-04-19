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
    this.kanjiService.getRandomKanji().subscribe(data => {
      this.kanji = data.kanji;
      this.meanings = data.meanings;
      this.kunReadings = data.kun_readings;
      this.onReadings = data.on_readings;
      this.jlptLevel = data.jlpt;
    });
  }
}
