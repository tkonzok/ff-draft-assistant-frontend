import { Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable, ReplaySubject, take } from 'rxjs';
import { DraftService } from './draft.service';

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

  constructor(private draftService: DraftService) {
    this.init().subscribe();
  }

  refresh() {
    this.draftService.refreshAll().pipe(take(1)).subscribe();
  }

  private init(): Observable<void> {
    this.initStatus.next(MasterDataInitStatus.IN_PROGRESS);
    return this.draftService.init().pipe(
      map(() => {
        this.initStatus.next(MasterDataInitStatus.SUCCESS);
      }),
      catchError((e) => {
        console.error(e);
        this.initStatus.next(MasterDataInitStatus.FAILED);
        return EMPTY;
      }),
    );
  }

  get initStatus$(): Observable<MasterDataInitStatus> {
    return this.initStatus.asObservable();
  }
}
