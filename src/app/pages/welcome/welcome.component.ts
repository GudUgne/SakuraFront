import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {MATERIAL_IMPORTS} from '../../material.shared';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    MATERIAL_IMPORTS,
    RouterLink,
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {

}
