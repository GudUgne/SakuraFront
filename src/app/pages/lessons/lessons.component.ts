import {Component} from '@angular/core';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [MATERIAL_IMPORTS, FormsModule],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css'
})
export class LessonsComponent {

}
