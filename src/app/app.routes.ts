import { Routes } from '@angular/router';

import { WelcomeComponent } from './pages/welcome/welcome.component';
import { JoinComponent } from './pages/join/join.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { HomeComponent } from './pages/home/home.component';
import { VocabularyComponent } from './pages/vocabulary/vocabulary.component';
import { CharactersComponent } from './pages/characters/characters.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { StudyGroupsComponent } from './pages/studygroups/study-groups.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard} from './auth.guard';
import {GroupDetailComponent} from './pages/group-detail/group-detail.component';
import {ExerciseComponent} from './pages/exercise/exercise.component';
import {HomeworkComponent} from './pages/homework/homework.component';
import {FreetextEditComponent} from './components/freetext-edit/freetext-edit.component';
import {FreetextExerciseComponent} from './components/freetext-exercise/freetext-exercise.component';
import {LessonTakingComponent} from './components/lesson-taking/lesson-taking.component';
import {LessonViewComponent} from './components/lesson-view/lesson-view.component';
import {HomeworkOverviewComponent} from './components/homework-overview/homework-overview.component';

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

      { path: 'homework', component: HomeworkComponent },

      {
        path: 'exercise',
        component: ExerciseComponent,
        canActivate: [AuthGuard],
        data: { teacherOnly: true }
      },
      {
        path: 'exercise/create',
        component: FreetextEditComponent,
        canActivate: [AuthGuard],
        data: { teacherOnly: true }
      },
      {
        path: 'exercise/edit/:id',
        component: FreetextEditComponent,
        canActivate: [AuthGuard],
        data: { teacherOnly: true }
      },

      // Lessons
      { path: 'lessons', component: LessonsComponent },
      {
        path: 'lessons/view/:id',
        component: LessonViewComponent,
        canActivate: [AuthGuard],
        data: { teacherOnly: true }
      },
      { path: 'lessons/:id/take', component: LessonTakingComponent },

      { path: 'homework', component: HomeworkComponent },
      {
        path: 'homework/overview/:id',
        component: HomeworkOverviewComponent,
        canActivate: [AuthGuard],
        data: { teacherOnly: true }
      },

      { path: 'messages', component: MessagesComponent },
      { path: 'studygroups', component: StudyGroupsComponent },
      { path: 'groups/:id', component: GroupDetailComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },

  // Fallback route: redirect any unknown paths to the welcome page
  { path: '**', redirectTo: '' }
];
