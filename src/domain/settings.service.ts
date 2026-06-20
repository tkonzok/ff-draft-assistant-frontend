import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToInstance } from 'class-transformer';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { map, Observable, of, ReplaySubject, switchMap, take, tap } from 'rxjs';
import { STORE_NAME_SETTINGS } from '../app/indexed-db-config';
import { environment } from '../environments/environment';
import { ObservableInstanceMapper } from '../utils/observable-instance-mapper';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public static readonly SETTINGS_URL: string = `${environment.apiUrl}/players/settings`;
  private readonly settings$: ReplaySubject<string[]> = new ReplaySubject(1);
  private readonly selectedSetting$: ReplaySubject<string> = new ReplaySubject(1);

  constructor(
    private http: HttpClient,
    private dbService: NgxIndexedDBService,
  ) {}

  init(): Observable<void> {
    return this.loadAll().pipe(
      tap((settings) => this.settings$.next(settings?.settings || [])),
      switchMap(() => this.refreshAll()),
      map(() => undefined),
    );
  }

  getSelectedSetting$(): Observable<string> {
    return this.selectedSetting$.asObservable();
  }

  getSettings$(): Observable<string[]> {
    return this.settings$.asObservable();
  }

  selectSettings(settings: string): void {
    this.selectedSetting$.next(settings);
  }

  refreshAll() {
    return this.loadSettingsFromApi().pipe(
      take(1),
      tap((settings) => this.settings$.next(settings.settings)),
      switchMap((settings) =>
        this.clear().pipe(
          map(() => settings),
          switchMap((settings) => this.storeSettingsInDB(settings)),
        ),
      ),
    );
  }

  private loadAll() {
    return this.dbService
      .count(STORE_NAME_SETTINGS)
      .pipe(switchMap((count: number) => (count > 0 ? this.loadSettingsFromDB() : of(undefined))));
  }

  private loadSettingsFromApi(): Observable<Settings> {
    return this.http.get<Settings>(SettingsService.SETTINGS_URL).pipe(map((settings) => plainToInstance(Settings, settings)));
  }

  private loadSettingsFromDB(): Observable<Settings> {
    return ObservableInstanceMapper.valueToInstance(this.dbService.getAll<Settings>(STORE_NAME_SETTINGS), Settings);
  }

  private storeSettingsInDB(settings: Settings) {
    return this.dbService.add(STORE_NAME_SETTINGS, settings);
  }

  private clear(): Observable<void> {
    return this.dbService.clear(STORE_NAME_SETTINGS);
  }
}
