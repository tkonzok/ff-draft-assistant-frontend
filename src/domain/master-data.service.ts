import { Injectable } from '@angular/core';
import { catchError, EMPTY, interval, map, Observable, ReplaySubject, take } from 'rxjs';
import { ScheduleService } from './schedule.service';

export enum MasterDataInitStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private static readonly UPDATE_CHECK_INTERVAL_MILLIS = 30 * 60 * 1000; // 30 minutes
  private static readonly UPDATE_INTERVAL_MILLIS = 7 * 24 * 60 * 60 * 1000; // 1 week

  private initStatus = new ReplaySubject<MasterDataInitStatus>(1);

  constructor(private scheduleService: ScheduleService) {
    this.init().subscribe();
    interval(MasterDataService.UPDATE_CHECK_INTERVAL_MILLIS).subscribe(() => {
      this.updateDataIfNecessary();
    });
  }

  refresh() {
    this.scheduleService.refreshAll().pipe(take(1)).subscribe();
  }

  private init(): Observable<void> {
    this.initStatus.next(MasterDataInitStatus.IN_PROGRESS);
    return this.scheduleService.init().pipe(
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

  private updateDataIfNecessary() {
    // this.lastProductUpdateService.getLastUpdated().subscribe((lastUpdate) => {
    //   const now = new Date().getTime();
    //
    //   if (!navigator.onLine) {
    //     console.debug("Product data could not be updated because client is offline");
    //     return;
    //   }
    //
    //   if (!lastUpdate || new Date(lastUpdate.date).getTime() < now - MasterDataService.UPDATE_INTERVAL_MILLIS) {
    //     this.refresh();
    //   }
    // });
  }
}
