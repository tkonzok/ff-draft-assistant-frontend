import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToInstance } from 'class-transformer';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import {map, Observable, of, switchMap, take} from 'rxjs';
import { STORE_NAME_SCHEDULE } from '../app/indexed-db-config';
import { environment } from '../environments/environment';
import { ObservableInstanceMapper } from '../utils/observable-instance-mapper';
import { Schedule } from './schedule';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private static readonly SCHEDULE_URL: string = `${environment.apiUrl}/schedule`;

  constructor(
    private http: HttpClient,
    private dbService: NgxIndexedDBService,
  ) {}

  init(): Observable<Schedule[]> {
    return this.loadAll().pipe(
      switchMap((schedule) => schedule.length ? of(schedule) : this.refreshAll()),
    );
  }

  getSchedule(): Observable<Schedule[]> {
    return this.loadScheduleFromDB();
  }

  refreshAll() {
    return this.loadScheduleFromApi().pipe(
      take(1),
      switchMap((schedule) => this.clearAll().pipe(switchMap(() => this.storeScheduleInDB(schedule)))),
    );
  }

  private loadAll(): Observable<Schedule[]> {
    return this.dbService
      .count(STORE_NAME_SCHEDULE)
      .pipe(switchMap((count: number) => (count > 0 ? this.loadScheduleFromDB() : of([]))));
  }

  private loadScheduleFromApi(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(ScheduleService.SCHEDULE_URL).pipe(
      map((schedule) =>
        plainToInstance(Schedule, schedule, {
          excludeExtraneousValues: true,
        }),
      ),
    );
  }

  private loadScheduleFromDB(): Observable<Schedule[]> {
    return ObservableInstanceMapper.valuesToInstance(this.dbService.getAll<Schedule>(STORE_NAME_SCHEDULE), Schedule);
  }

  private storeScheduleInDB(schedule: Schedule[]): Observable<Schedule[]> {
    return this.dbService.bulkAdd(STORE_NAME_SCHEDULE, schedule).pipe(map(() => schedule));
  }

  private clearAll(): Observable<void> {
    return this.dbService.clear(STORE_NAME_SCHEDULE);
  }
}
