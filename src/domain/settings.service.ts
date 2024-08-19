import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SettingsService {
  private readonly SETTINGS: string[] = [
    "hppr1qb",
    "ppr1qb",
    "hpprSf",
    "upsidebowl1qb",
  ];
  private selectedSettingSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>(this.SETTINGS[0]);

  get availableSettings(): string[] {
    return this.SETTINGS;
  }

  get selectedSetting$(): Observable<string> {
    return this.selectedSettingSubject.asObservable();
  }

  selectSettings(settings: string): void {
    this.selectedSettingSubject.next(settings);
  }
}
