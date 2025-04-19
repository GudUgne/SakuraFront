import { Routes } from '@angular/router';

import { WelcomeComponent } from './pages/welcome/welcome.component';
import { JoinComponent } from './pages/join/join.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HomeComponent } from './pages/home/home.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { FlashcardsComponent } from './pages/flashcards/flashcards.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { StudygroupsComponent } from './pages/studygroups/studygroups.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard} from './auth.guard';

export const routes: Routes = [
  // Public routes available to any user
  { path: '', component: WelcomeComponent },
  { path: 'join', component: JoinComponent },

  // Protected routes for authenticated users only
  {
    path: 'app',
    component: NavigationComponent,  // This component contains the navigation bar/sidebar
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'vocabulary', component: VocabularyComponent },
      { path: 'characters', component: CharactersComponent },
      { path: 'flashcards', component: FlashcardsComponent },
      { path: 'lessons', component: LessonsComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'studygroups', component: StudygroupsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },

  // Fallback route: redirect any unknown paths to the welcome page
  { path: '**', redirectTo: '' }
];
