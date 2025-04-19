import {Component} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {KanaGridComponent} from '../../components/kana-grid/kana-grid.component';
import {KanjiTabComponent} from '../../components/kanji-tab/kanji-tab.component';

@Component({
  selector: 'app-characters',
  imports: [
    MatTabGroup,
    MatTab,
    KanaGridComponent,
    KanjiTabComponent
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent {

}
