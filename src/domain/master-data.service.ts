import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { catchError, EMPTY, forkJoin, map, Observable, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { STORE_NAME_LAST_UPDATE } from '../app/indexed-db-config';
import { DraftService } from './draft.service';
import { PlayerService } from './player.service';
import { SettingsService } from './settings.service';

export enum MasterDataInitStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private initStatus = new ReplaySubject<MasterDataInitStatus>(1);
  private lastUpdated = new ReplaySubject<Date>(1);

  constructor(
    private draftService: DraftService,
    private settingsService: SettingsService,
    private playerService: PlayerService,
    private dbService: NgxIndexedDBService,
  ) {}

  refresh() {
    forkJoin({
      drafts: this.draftService.refreshAll().pipe(take(1)),
      settings: this.settingsService.refreshAll().pipe(take(1)),
      player: this.playerService.refreshAll().pipe(take(1)),
    })
      .pipe(
        switchMap(() => this.dbService.clear(STORE_NAME_LAST_UPDATE)),
        switchMap(() => this.dbService.add(STORE_NAME_LAST_UPDATE, new Date())),
        tap(() => this.updateLastUpdateSubject()),
      )
      .subscribe();
  }

  init() {
    this.initStatus.next(MasterDataInitStatus.IN_PROGRESS);
    this.updateLastUpdateSubject();
    forkJoin({
      drafts: this.draftService.init(),
      settings: this.settingsService.init(),
      players: this.playerService.init(),
    })
      .pipe(
        take(1),
        map(() => {
          this.initStatus.next(MasterDataInitStatus.SUCCESS);
        }),
        switchMap(() => this.dbService.clear(STORE_NAME_LAST_UPDATE)),
        switchMap(() => this.dbService.add(STORE_NAME_LAST_UPDATE, { id: 'global', lastUpdate: new Date() })),
        tap(() => this.updateLastUpdateSubject()),
        map(() => undefined),
        catchError((e) => {
          console.error(e);
          this.initStatus.next(MasterDataInitStatus.FAILED);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  get initStatus$(): Observable<MasterDataInitStatus> {
    return this.initStatus.asObservable();
  }

  get lastUpdated$(): Observable<Date> {
    return this.lastUpdated.asObservable();
  }

  private updateLastUpdateSubject() {
    this.dbService
      .getAll<{ id: string; lastUpdate: Date }>(STORE_NAME_LAST_UPDATE)
      .pipe(
        take(1),
        tap((lastUpdateStrings: { id: string; lastUpdate: Date }[]) => {
          this.lastUpdated.next(lastUpdateStrings[0]?.lastUpdate);
        }),
      )
      .subscribe();
  }
}
