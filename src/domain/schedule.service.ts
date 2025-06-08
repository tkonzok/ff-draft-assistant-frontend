import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToInstance } from 'class-transformer';
import { map } from 'rxjs';
import { environment } from '../environments/environment';
import { Schedule } from './schedule';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private static readonly SCHEDULE_URL: string = `${environment.apiUrl}/schedule`;

  constructor(private http: HttpClient) {}

  getSchedule() {
    return this.http.get<Schedule[]>(ScheduleService.SCHEDULE_URL).pipe(
      map((schedule) =>
        plainToInstance(Schedule, schedule, {
          excludeExtraneousValues: true,
        }),
      ),
    );
  }
}
