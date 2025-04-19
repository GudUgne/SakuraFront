import {Component} from '@angular/core';
import {TodoWidgetComponent} from '../../components/todo-widget/todo-widget.component';
import {KanjiHomeWidgetComponent} from '../../components/kanji-home-widget/kanji-home-widget.component';

@Component({
  selector: 'app-home',
  imports: [
    TodoWidgetComponent,
    KanjiHomeWidgetComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
