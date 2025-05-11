import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DictionaryService} from '../../services/dictionary.service';
import {MATERIAL_IMPORTS} from '../../material.shared';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, FormsModule, MATERIAL_IMPORTS],
  templateUrl: './dictionary.component.html',
  styleUrl: './dictionary.component.css'
})

export class DictionaryComponent {
  searchTerm = '';
  searchType: 'words' | 'kanji' = 'words';
  results: any;
  isLoading = false;

  constructor(private dictionaryService: DictionaryService) {}

  search() {
    if (!this.searchTerm.trim()) {
      return;
    }
    this.isLoading = true;
    this.dictionaryService.search(this.searchTerm, this.searchType).subscribe(data => {
      this.results = data;
      this.isLoading = false;
    });
  }

  playAudio(audioPath: string) {
    const baseUrl = 'https://jotoba.de';
    const audio = new Audio(`${baseUrl}${audioPath}`);
    audio.play().catch(err => console.error('Audio playback failed:', err));
  }

  clearResults() {
    this.results = null;
  }

}


