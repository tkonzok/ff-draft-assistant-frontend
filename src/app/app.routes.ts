import { Routes } from "@angular/router";
import {LeaguesComponent} from "../components/leagues/leagues.component";
import {DraftsComponent} from "../components/drafts/drafts.component";

export const routes: Routes = [
  {
    path: "drafts",
    component: DraftsComponent,
  },
  {
    path: "leagues",
    component: LeaguesComponent,
  },
  {
    path: "**",
    redirectTo: "drafts",
  },
];
