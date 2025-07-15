import { Routes } from '@angular/router';
import { DraftsComponent } from '../components/drafts/drafts.component';
import { RankingsComponent } from '../components/drafts/rankings/rankings.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'drafts',
        component: DraftsComponent,
      },
      {
        path: 'rankings',
        component: RankingsComponent,
      },
      {
        path: '**',
        redirectTo: 'drafts',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
