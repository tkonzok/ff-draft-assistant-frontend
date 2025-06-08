import { Routes } from '@angular/router';
import { DraftsComponent } from '../components/drafts/drafts.component';
import { RankingsComponent } from '../components/drafts/rankings/rankings.component';
import { LeaguesComponent } from '../components/leagues/leagues.component';

export const routes: Routes = [
  {
    path: 'drafts',
    component: DraftsComponent,
  },
  {
    path: 'rankings',
    component: RankingsComponent,
  },
  {
    path: 'leagues',
    component: LeaguesComponent,
  },
  {
    path: '**',
    redirectTo: 'drafts',
  },
];
