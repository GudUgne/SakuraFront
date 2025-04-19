import {Component} from '@angular/core';
import { ExerciseMatchService, ExerciseMatch } from '../../services/exercise-match.service';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {MatchKanjiGeneratorComponent} from '../../components/match-kanji-generator/match-kanji-generator.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-lessons',
  imports: [MATERIAL_IMPORTS, MatchKanjiGeneratorComponent, FormsModule],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css'
})
export class LessonsComponent {
  matches: ExerciseMatch[] = [];

  constructor(private matchService: ExerciseMatchService) {}

  ngOnInit(): void {
    this.matchService.getMatches().subscribe({
      next: (data) => {
        this.matches = data;
      },
      error: () => {
        alert('Failed to load matches.');
      }
    });
  }
}
