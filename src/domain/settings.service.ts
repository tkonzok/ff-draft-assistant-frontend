import { Injectable } from "@angular/core";
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {plainToInstance} from "class-transformer";
import {Settings} from "./settings";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  public static readonly SETTINGS_URL: string = `${environment.apiUrl}/players/settings`;
  private selectedSettingSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>("");
  private availableSettingsSubject: BehaviorSubject<string[]> =
    new BehaviorSubject<string[]>([]);

  constructor(
    private http: HttpClient,
  ) {
    this.http.get<Settings>(SettingsService.SETTINGS_URL).pipe(
      map((settings) => plainToInstance(Settings, settings)),
      tap((settings) => this.availableSettingsSubject.next(settings.settings))
    ).subscribe()
  }

  get selectedSetting$(): Observable<string> {
    return this.selectedSettingSubject.asObservable();
  }

  get availableSettings$(): Observable<string[]> {
    return this.availableSettingsSubject.asObservable();
  }

  selectSettings(settings: string): void {
    this.selectedSettingSubject.next(settings);
  }
}
